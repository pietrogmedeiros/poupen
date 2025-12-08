import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/env";
import { getFinancialInsights } from "@/lib/gemini";

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServer();
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all transactions
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const insights = await getFinancialInsights(
      (transactions || []).map((t: any) => ({
        amount: t.amount,
        category: t.category,
        date: t.created_at,
        type: t.type,
        description: t.description,
      })),
      userId
    );

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error getting financial insights:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
