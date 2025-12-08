import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { forecastNextMonthSpending } from "@/lib/gemini";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get transactions from last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", sixMonthsAgo.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    const forecast = await forecastNextMonthSpending(
      (transactions || []).map((t) => ({
        amount: t.amount,
        category: t.category,
        date: t.created_at,
        type: t.type,
      })),
      userId
    );

    return NextResponse.json(forecast);
  } catch (error) {
    console.error("Error forecasting spending:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
