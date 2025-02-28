const express = require("express");
const router = express.Router();
const registration = require("../model/registration");

const stake2 = require("../model/stake");
const moment = require("moment-timezone");
const WithdrawalModel = require("../model/withdraw");
const { verifyToken } = require("../Middleware/jwtToken");
const { compareSync } = require("bcrypt");
const UserIncome = require("../model/UserIncome");
const { default: axios } = require("axios");
const PackageBuy = require("../model/PackageBuy");
const newuserplace = require("../model/newuserplace");
const AdminCred = require("../model/AdminCred");

router.get("/dashborad", async (req, res) => {
  try {
    const startOfToday = moment.tz("Asia/Kolkata").startOf("day").toDate();
    const endOfToday = moment.tz("Asia/Kolkata").endOf("day").toDate();

    console.log(startOfToday, ":::", endOfToday);

    const totaluser = await registration.find({}).countDocuments();
    const activeUser = await registration.find({ stake_amount: { $gt: 0 } }).countDocuments();
    const inactiveUser = await registration.find({ stake_amount: 0 }).countDocuments();

    const allTimeTotals = await stake2.aggregate([
      {
        $group: {
          _id: "$plan",
          totalAmount: { $sum: "$amount" },
          totalToken: { $sum: "$token" },
        }
      }
    ]);

    const todayTotals = await stake2.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfToday,
            $lt: endOfToday,
          },
        },
      },
      {
        $group: {
          _id: "$plan",
          totalAmount: { $sum: "$amount" },
          totalToken: { $sum: "$token" },
        },
      },
    ]);

    const formatTotals = (totals) => {
      const result = {
        DSC: { totalAmount: 0, totalToken: 0 },
        USDT: { totalAmount: 0, totalToken: 0 },
        stDSC: { totalAmount: 0, totalToken: 0 },
      };

      totals.forEach(({ _id: plan, totalAmount, totalToken }) => {
        if (result[plan]) {
          result[plan].totalAmount = totalAmount;
          result[plan].totalToken = totalToken;
        }
      });

      return result;
    };

    const allTimeFormatted = formatTotals(allTimeTotals);
    const todayFormatted = formatTotals(todayTotals);

    const allTimeTotalStake = await stake2.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const todayTotalStake = await stake2.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfToday,
            $lt: endOfToday
          }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const allTimeAmount = allTimeTotalStake.length > 0 ? allTimeTotalStake[0].totalAmount : 0;
    const todayAmount = todayTotalStake.length > 0 ? todayTotalStake[0].totalAmount : 0;

    // New: Aggregate total withdrawal amount and token where isapprove is true
    const totalWithdrawal = await WithdrawalModel.aggregate([
      {
        $match: { isapprove: true }
      },
      {
        $group: {
          _id: null,
          totalWithdrawalAmount: { $sum: "$withdrawAmount" },
          totalWithdrawalToken: { $sum: "$withdrawToken" }
        }
      }
    ]);

    const totalWithdrawalAmount = totalWithdrawal.length > 0 ? totalWithdrawal[0].totalWithdrawalAmount : 0;
    const totalWithdrawalToken = totalWithdrawal.length > 0 ? totalWithdrawal[0].totalWithdrawalToken : 0;

    // Respond with all data, including the new withdrawal totals
    return res.json({
      totaluser,
      activeUser,
      inactiveUser,
      allTimeTotals: allTimeFormatted,
      todayTotals: todayFormatted,
      allTimeAmount,
      todayAmount,
      totalWithdrawalAmount,   // New field
      totalWithdrawalToken     // New field
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard", async (req,res)=>{
  let {user} = req.query
  let data = await registration.findOne({user})
  res.json(data)
})

router.get("/recentTransaction", async (req,res)=>{
  const {user} = req.query;
  const data = await PackageBuy.find({user}).sort({ createdAt: -1 });
  res.json(data)
})
router.get("/recentTransactionGlobal", async (req,res)=>{
  // const {user} = req.query;
  const data = await PackageBuy.find().sort({ createdAt: -1 });
  res.json(data)
})

router.get("/Income", async (req,res)=>{
  const {user} = req.query;
  const data = await UserIncome.find({receiver: user}).sort({ createdAt: -1 });

  const mergedData = await Promise.all(data.map(async (record) => {
    const userDetails = await registration.findOne({ user: record.sender }); // Assuming userId is stored in newuserplace records
    // console.log(userDetails)

    // Step 3: Merge the user details with the newuserplace record
    return {
      ...record.toObject(), // Convert Mongoose document to plain JavaScript object
      userId: userDetails ? userDetails.userId : null // Add user details to the record
    };
  }));

  // Step 4: Return the merged data as a JSON response
  res.json(mergedData);
  // res.json(data)
})

router.get("/newuserplace", async (req,res)=>{
  const {user} = req.query;
  const data = await newuserplace.find({referrer: user}).sort({ createdAt: -1 });
  res.json(data)
})
router.get("/newuserplacePool", async (req, res) => {
  const { user, poolId } = req.query;

  try {
    // Step 1: Fetch records from newuserplace collection
    const data = await newuserplace.find({ referrer: user, poolId: poolId }).sort({ createdAt: -1 });

    // Step 2: For each record, find the corresponding user details from the registration schema
    const mergedData = await Promise.all(data.map(async (record) => {
      const userDetails = await registration.findOne({ user: record.user }); // Assuming userId is stored in newuserplace records

      // Step 3: Merge the user details with the newuserplace record
      return {
        ...record.toObject(), // Convert Mongoose document to plain JavaScript object
        userId: userDetails ? userDetails.userId : null // Add user details to the record
      };
    }));

    // Step 4: Return the merged data as a JSON response
    res.json(mergedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/referralhistory", async (req, res) => {
  try {
    const { referrer } = req.query;

    // Fetch users referred by `referrer`
    const data = await registration.find({ referrer: referrer }).sort({ createdAt: -1 });

    // Fetch package purchases for referred users
    const data2 = await PackageBuy.find({ user: { $in: data.map(d => d.user) } }).sort({ createdAt: -1 });

    // Filter only packageId === 2
    const filteredData = data2.filter(item => item.packageId === 2);

    const mergedData = await Promise.all(filteredData.map(async (record) => {
      const userDetails = await registration.findOne({ user: record.user }); // Assuming userId is stored in newuserplace records

      // Step 3: Merge the user details with the newuserplace record
      return {
        ...record.toObject(), // Convert Mongoose document to plain JavaScript object
        userId: userDetails ? userDetails.userId : null // Add user details to the record
      };
    }));

    // Merge data with corresponding package details
    // const mergedData = data.map(record => {
    //   const packageDetails = filteredData.find(p => p.user === record.user);
    //   return {
    //     ...record.toObject(),
    //     packageDetails: packageDetails || null // Add package details if found, else null
    //   };
    // });

    res.json({ data,mergedData });
  } catch (error) {
    console.error("Error fetching referral history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



router.get("/adminlogin", async (req,res)=>{
  const {email, password} = req.query;
  const data = await AdminCred.findOne({email, password});
  res.json(data)
})
router.get("/getallusers", async (req,res)=>{
  // const {email, password} = req.query;
  const data = await registration.find().sort({ createdAt: -1 });
  res.json(data)
})

router.get('/getAddressbyRefrralId', async (req, res) => {
  try {
    const { ref_id } = req.query;

    // Check if targetBusiness is provided and is a valid number
    if (!ref_id) {
      return res.status(400).json({ error: 'ref_id is required' });
    }

    // Find all stakeReward records matching the targetBusiness criteria
    const record = await registration.findOne({ user: ref_id });

   

    // Respond with the list of users and their associated registration details
    res.status(200).json(record.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
// router.get("/home", async (req,res)=>{
//   // const hello = "Hello World";
//   const hello = "Hello0000 Worldxx";
//   res.json({hello})
// })

// router.get("/graph-data", verifyToken, async (req, res) => {
//   try {
//     const todayKolkata = moment.tz("Asia/Kolkata").startOf("day");
//     const sevenDaysAgoKolkata = todayKolkata.clone().subtract(6, "days");

//     async function fetchDataForDay(dayIndex) {
//       const startOfDayKolkata = sevenDaysAgoKolkata
//         .clone()
//         .add(dayIndex, "days");
//       const endOfDayKolkata = startOfDayKolkata
//         .clone()
//         .add(1, "days")
//         .subtract(1, "milliseconds");

//       const [stakes, withdraw, topups] = await Promise.all([
//         stake2.find({
//           createdAt: {
//             $gte: startOfDayKolkata.toDate(),
//             $lt: endOfDayKolkata.toDate(),
//           },
//         }),
//         WithdrawalModel.find({
//           timestamp: {
//             $gte: startOfDayKolkata.toDate(),
//             $lt: endOfDayKolkata.toDate(),
//           },
//         }),
//         topup2.find({
//           createdAt: {
//             $gte: startOfDayKolkata.toDate(),
//             $lt: endOfDayKolkata.toDate(),
//           },
//         }),
//       ]);

//       const filteredStakes = stakes.filter((stake) => {
//         const condition1 = stake.ratio == "10" && stake.token == "WYZ-stUSDT";
//         const condition2 = stake.ratio == "20" && stake.token == "WYZ-stUSDT";
//         const condition3 = stake.ratio == "30" && stake.token == "WYZ-stUSDT";
//         const condition4 = stake.ratio == "40" && stake.token == "WYZ-stUSDT";
//         const condition5 = stake.ratio == "50" && stake.token == "WYZ-stUSDT";
//         const condition6 = stake.ratio == "15" && stake.token == "sUSDT-stUSDT";
//         const condition7 = stake.ratio == "20" && stake.token == "sUSDT-stUSDT";
//         const condition8 = stake.ratio == "25" && stake.token == "sUSDT-stUSDT";
//         return (
//           condition1 ||
//           condition2 ||
//           condition3 ||
//           condition4 ||
//           condition5 ||
//           condition6 ||
//           condition7 ||
//           condition8
//         );
//       });

//       const total = filteredStakes.reduce(
//         (acc, stake) => acc + stake.amount,
//         0
//       );

//       const wyz = filteredStakes.reduce((acc, stake) => {
//         if (stake.ratio == "10") return acc + (stake.amount * 0.1) / 20;
//         if (stake.ratio == "20") return acc + (stake.amount * 0.2) / 20;
//         if (stake.ratio == "30") return acc + (stake.amount * 0.3) / 20;
//         if (stake.ratio == "40") return acc + (stake.amount * 0.4) / 20;
//         if (stake.ratio == "50") return acc + (stake.amount * 0.5) / 20;
//         if (stake.ratio == "15" && stake.token == "sUSDT-stUSDT")
//           return acc + (stake.amount * 0.15) / 20;
//         if (stake.ratio == "20" && stake.token == "sUSDT-stUSDT")
//           return acc + (stake.amount * 0.2) / 20;
//         if (stake.ratio == "25" && stake.token == "sUSDT-stUSDT")
//           return acc + (stake.amount * 0.25) / 20;
//         return acc;
//       }, 0);
//       const transformedAmount = filteredStakes.reduce((acc, stake) => {
//         if (stake.ratio == "10") return acc + stake.amount * 0.9;
//         if (stake.ratio == "20") return acc + stake.amount * 0.8;
//         if (stake.ratio == "30") return acc + stake.amount * 0.7;
//         if (stake.ratio == "40") return acc + stake.amount * 0.6;
//         if (stake.ratio == "50") return acc + stake.amount * 0.5;
//         if (stake.ratio == "15" && stake.token == "sUSDT-stUSDT")
//           return acc + stake.amount * 0.85;
//         if (stake.ratio == "20" && stake.token == "sUSDT-stUSDT")
//           return acc + stake.amount * 0.8;
//         if (stake.ratio == "25" && stake.token == "sUSDT-stUSDT")
//           return acc + stake.amount * 0.75;
//         return acc;
//       }, 0);

//       const stakeusdt = stakes.filter((stake) => {
//         const usdt1 = stake.ratio == "15" && stake.token == "sUSDT-stUSDT";
//         const usdt2 = stake.ratio == "20" && stake.token == "sUSDT-stUSDT";
//         const usdt3 = stake.ratio == "25" && stake.token == "sUSDT-stUSDT";

//         return usdt1 || usdt2 || usdt3;
//       });

//       const totalusdt = stakeusdt.reduce((acc, stake) => {
//         if (stake.ratio == "15" && stake.token == "sUSDT-stUSDT")
//           return acc + stake.amount * 0.85;
//         if (stake.ratio == "20" && stake.token == "sUSDT-stUSDT")
//           return acc + stake.amount * 0.8;
//         if (stake.ratio == "25" && stake.token == "sUSDT-stUSDT")
//           return acc + stake.amount * 0.75;
//         return acc;
//       }, 0);

//       const roiWithdraw = withdraw
//         .filter(
//           (withdrawroi) =>
//             withdrawroi.wallet_type == "roi" && withdrawroi.isapprove == true
//         )
//         .reduce((acc, withdrawroi) => acc + withdrawroi.withdrawAmount, 0);

//       const referralWithdraw = withdraw
//         .filter(
//           (withdrawreferral) =>
//             withdrawreferral.wallet_type == "referral" &&
//             withdrawreferral.isapprove == true
//         )
//         .reduce(
//           (acc, withdrawreferral) => acc + withdrawreferral.withdrawAmount,
//           0
//         );

//       const topupdata = topups.reduce((acc, data) => {
//         const amount = parseFloat(data.amount);
//         return acc + amount;
//       }, 0);

//       return {
//         day: startOfDayKolkata.format("dddd"),
//         stakewyz: parseFloat(wyz),
//         stakestusdt: parseFloat(transformedAmount),
//         total: parseFloat(total),
//         topus: parseFloat(topupdata),
//         stakeusdt: parseFloat(totalusdt),
//         roi: parseFloat(roiWithdraw),
//         referral: parseFloat(referralWithdraw),
//       };
//     }

//     const results = await Promise.all(
//       Array.from({ length: 7 }).map((_, index) => fetchDataForDay(index))
//     );

//     const Stakeswyz = {};
//     const Stakestusdt = {};
//     const Stakeusdt = {};
//     const Totalamount = {};
//     const Topusdata = {};
//     const withdrawRoi = {};
//     const refrealWithdraw = {};

//     results.forEach(
//       ({
//         day,
//         stakewyz,
//         stakestusdt,
//         stakeusdt,
//         roi,
//         referral,
//         topus,
//         total,
//       }) => {
//         Stakeswyz[day] = stakewyz;
//         Stakestusdt[day] = stakestusdt;
//         Stakeusdt[day] = stakeusdt;
//         Totalamount[day] = total;
//         Topusdata[day] = topus;
//         withdrawRoi[day] = roi;
//         refrealWithdraw[day] = referral;
//       }
//     );

//     return res.json({
//       status: 200,
//       error: false,
//       Stakeswyz,
//       Stakestusdt,
//       Stakeusdt,
//       Totalamount,
//       Topusdata,
//       withdrawRoi,
//       refrealWithdraw,
//     });
//   } catch (error) {
//     console.error("Error calculating data:", error);
//     return res.status(500).json({
//       status: 500,
//       error: true,
//       message: "Internal Server Error",
//     });
//   }
// });

module.exports = router;
