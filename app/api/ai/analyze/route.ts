import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { analyzeTransactions } from "@/lib/gemini";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { month, year } = body;

    // Get transactions for specific month or all
    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "expense");

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query = query
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());
    }

    const { data: transactions, error } = await query;

    if (error) throw error;

    const analysis = await analyzeTransactions(
      (transactions || []).map((t) => ({
        amount: t.amount,
        category: t.category,
        date: t.created_at,
        description: t.description,
      }))
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
