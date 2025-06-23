const User = require("../models/User");
const Loan = require("../models/Loan");
const Book = require("../models/Book");
const Category = require("../models/Category");
const Comment = require("../models/Comment");
const mongoose = require("mongoose");

// 1. Dashboard Summary Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalBooks = await Book.countDocuments();
    const borrowedBooks = await Loan.countDocuments({ isReturned: false });
    const overdueBooks = await Loan.countDocuments({
      isReturned: false,
      returnDate: { $lt: new Date() }
    });
    const activeLoans = await Loan.countDocuments({ isReturned: false });

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newUsersThisMonth = await User.countDocuments({
      role: "student",
      createdAt: { $gte: monthStart }
    });

    res.json({
      totalStudents,
      totalBooks,
      borrowedBooks,
      overdueBooks,
      activeLoans,
      newUsersThisMonth
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// 2. Category Distribution
exports.getCategoryDistribution = async (req, res) => {
  try {
    const distribution = await Book.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      {
        $unwind: "$categoryInfo"
      },
      {
        $project: {
          category: "$categoryInfo.name",
          count: 1
        }
      }
    ]);

    const total = distribution.reduce((sum, cat) => sum + cat.count, 0);
    const result = distribution.map(cat => ({
      category: cat.category,
      count: cat.count,
      percentage: ((cat.count / total) * 100).toFixed(2)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch category distribution" });
  }
};

// 3. Borrowing Trends (Monthly)
exports.getBorrowingTrends = async (req, res) => {
  try {
    const trends = await Loan.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$loanDate" },
            month: { $month: "$loanDate" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" }
                ]
              }
            ]
          },
          count: 1
        }
      }
    ]);

    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch borrowing trends" });
  }
};

// 4. Popular Books
exports.getPopularBooks = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  try {
    const books = await Loan.aggregate([
      {
        $group: {
          _id: "$book",
          borrowCount: { $sum: 1 }
        }
      },
      {
        $sort: { borrowCount: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book"
        }
      },
      {
        $unwind: "$book"
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "book",
          as: "comments"
        }
      },
      {
        $addFields: {
          rating: { $avg: "$comments.rating" }
        }
      },
      {
        $project: {
          id: "$book._id",
          title: "$book.title",
          author: "$book.author",
          borrowCount: 1,
          rating: { $round: ["$rating", 1] }
        }
      }
    ]);

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch popular books" });
  }
};

// 5. User Activity (Last X Days)
exports.getUserActivity = async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  try {
    const activity = await Loan.aggregate([
      { $match: { loanDate: { $gte: fromDate } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$loanDate" } }
          },
          newLoans: { $sum: 1 }
        }
      }
    ]);

    const returns = await Loan.aggregate([
      { $match: { isReturned: true, returnDate: { $gte: fromDate } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$returnDate" } }
          },
          returns: { $sum: 1 }
        }
      }
    ]);

    const users = await User.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          activeUsers: { $sum: 1 }
        }
      }
    ]);

    // Merge all data by date
    const map = {};

    const addToMap = (data, key) => {
      data.forEach(d => {
        const date = d._id.day;
        if (!map[date]) map[date] = { date };
        map[date][key] = d[key];
      });
    };

    addToMap(activity, "newLoans");
    addToMap(returns, "returns");
    addToMap(users, "activeUsers");

    const result = Object.values(map).map(d => ({
      date: d.date,
      newLoans: d.newLoans || 0,
      returns: d.returns || 0,
      activeUsers: d.activeUsers || 0
    }));

    res.json(result.sort((a, b) => new Date(a.date) - new Date(b.date)));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user activity" });
  }
};

// 6. Overdue Statistics
exports.getOverdueStats = async (req, res) => {
  try {
    const now = new Date();

    const overdueLoans = await Loan.find({
      isReturned: false,
      returnDate: { $lt: now }
    }).populate("student");

    const grouped = {};

    overdueLoans.forEach(loan => {
      const id = loan.student._id.toString();
      if (!grouped[id]) {
        grouped[id] = {
          userId: loan.student._id,
          userName: `${loan.student.name} ${loan.student.surname}`,
          overdueCount: 0,
          totalFine: 0
        };
      }
      grouped[id].overdueCount += 1;

      const overdueDays = Math.ceil((now - loan.returnDate) / (1000 * 60 * 60 * 24));
      const finePerDay = 2;
      grouped[id].totalFine += overdueDays * finePerDay;
    });

    const topOverdueUsers = Object.values(grouped)
      .sort((a, b) => b.overdueCount - a.overdueCount)
      .slice(0, 10);

    res.json({
      totalOverdue: overdueLoans.length,
      totalFines: topOverdueUsers.reduce((acc, u) => acc + u.totalFine, 0),
      topOverdueUsers
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch overdue stats" });
  }
};
