// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import { connectDB } from "../../lib/mongodb";
// import User from "../../models/Users";

// export async function GET() {
//   try {
//     await connectDB();

//     const adminEmail = "admin@example.com";
//     const judgeEmail = "judge1@example.com";

//     // Check if users already exist
//     const existingAdmin = await User.findOne({ email: adminEmail });
//     const existingJudge = await User.findOne({ email: judgeEmail });

//     if (existingAdmin && existingJudge) {
//       return NextResponse.json({ message: "Users already exist" });
//     }

//     const adminPassword = await bcrypt.hash("Admin123!", 10);
//     const judgePassword = await bcrypt.hash("Judge123!", 10);

//     const admin = existingAdmin
//       ? existingAdmin
//       : await User.create({
//           email: adminEmail,
//           name: "Admin",
//           password: adminPassword,
//           role: "admin",
//         });

//     const judge = existingJudge
//       ? existingJudge
//       : await User.create({
//           email: judgeEmail,
//           name: "Judge One",
//           password: judgePassword,
//           role: "judge",
//         });

//     return NextResponse.json({ message: "Users created successfully", admin, judge });
//   } catch (error) {
//     console.error("Seed Error:", error);
//     return NextResponse.json({ error: "Seeding failed" }, { status: 500 });
//   }
// }
