import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db/connection";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") || user.role;

  try {
    let stats = {};

    switch (role.toUpperCase()) {
      case "CUSTOMER":
        stats = await getCustomerStats(user.id);
        break;
      case "VETERINARIAN":
      case "SECRETARY":
      case "PETGROOMER":
        stats = await getStaffStats(role.toUpperCase());
        break;
      case "ADMINISTRATOR":
        stats = await getAdminStats();
        break;
      default:
        stats = {};
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

async function getCustomerStats(customerId: number) {
  try {
    // Get pet count
    const petCount = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM Pet WHERE owner_id = ? AND status = 'ACTIVE'",
      [customerId]
    );

    // Get upcoming appointments
    const upcomingAppointments = await query<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM Appointment a 
       JOIN Pet p ON a.pet_id = p.pet_id 
       WHERE p.owner_id = ? AND a.appointment_date >= CURDATE() AND a.status = 'SCHEDULED'`,
      [customerId]
    );

    // Get recent orders
    const recentOrders = await query<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM \`Order\` 
       WHERE customer_id = ? AND order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [customerId]
    );

    return {
      pets: petCount[0]?.count || 0,
      upcomingAppointments: upcomingAppointments[0]?.count || 0,
      recentOrders: recentOrders[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching customer stats:", error);
    return {};
  }
}

async function getStaffStats(role: string) {
  try {
    // Today's appointments
    const todayAppointments = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM Appointment WHERE DATE(appointment_date) = CURDATE() AND status = 'SCHEDULED'"
    );

    // Total active pets
    const totalPets = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM Pet WHERE status = 'ACTIVE'"
    );

    // Active customers
    const activeCustomers = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM Customer c JOIN User u ON c.customer_id = u.user_id WHERE u.status = 'ACTIVE'"
    );

    // Monthly revenue (simplified calculation)
    const monthlyRevenue = await query<{ total: number }[]>(
      `SELECT COALESCE(SUM(total_amount), 0) as total FROM \`Order\` 
       WHERE MONTH(order_date) = MONTH(CURDATE()) AND YEAR(order_date) = YEAR(CURDATE())`
    );

    return {
      todayAppointments: todayAppointments[0]?.count || 0,
      totalPets: totalPets[0]?.count || 0,
      activeCustomers: activeCustomers[0]?.count || 0,
      monthlyRevenue: Math.round(monthlyRevenue[0]?.total || 0),
    };
  } catch (error) {
    console.error("Error fetching staff stats:", error);
    return {};
  }
}

async function getAdminStats() {
  try {
    // Total customers
    const totalCustomers = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM Customer c JOIN User u ON c.customer_id = u.user_id WHERE u.status = 'ACTIVE'"
    );

    // Total appointments
    const totalAppointments = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM Appointment"
    );

    // Total products
    const totalProducts = await query<{ count: number }[]>(
      "SELECT COUNT(*) as count FROM Product WHERE status = 'ACTIVE'"
    );

    // Recent sales (last 30 days revenue)
    const recentSales = await query<{ total: number }[]>(
      `SELECT COALESCE(SUM(total_amount), 0) as total FROM \`Order\` 
       WHERE order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );

    // Pending orders
    const pendingOrders = await query<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM \`Order\` 
       WHERE status = 'PENDING'`
    );

    return {
      totalCustomers: totalCustomers[0]?.count || 0,
      totalAppointments: totalAppointments[0]?.count || 0,
      totalProducts: totalProducts[0]?.count || 0,
      recentSales: Number(recentSales[0]?.total || 0),
      pendingOrders: pendingOrders[0]?.count || 0,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      totalCustomers: 0,
      totalAppointments: 0,
      totalProducts: 0,
      recentSales: 0,
      pendingOrders: 0,
    };
  }
}
