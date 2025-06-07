"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function TestSupabasePage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test basic connection
      const { data, error } = await supabase.from("profiles").select("count");

      if (error) {
        setResult(`❌ Error: ${error.message}`);
      } else {
        setResult("✅ Supabase connected successfully!");
      }
    } catch (err) {
      setResult(`❌ Connection failed: ${err}`);
    }
    setLoading(false);
  };

  const testInsert = async () => {
    setLoading(true);
    try {
      const testAddress = "0x1234567890123456789012345678901234567890";

      // Test insert
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          address: testAddress,
          display_name: "Test User",
          bio: "Testing Supabase connection",
        })
        .select()
        .single();

      if (error) {
        setResult(`❌ Insert Error: ${error.message}`);
      } else {
        setResult(
          `✅ Insert successful! Created profile: ${data.display_name}`
        );
      }
    } catch (err) {
      setResult(`❌ Insert failed: ${err}`);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>

      <div className="space-y-4">
        <Button onClick={testConnection} disabled={loading}>
          {loading ? "Testing..." : "Test Connection"}
        </Button>

        <Button onClick={testInsert} disabled={loading} variant="outline">
          {loading ? "Testing..." : "Test Insert"}
        </Button>

        {result && (
          <div className="p-4 border rounded-lg">
            <p className="font-mono">{result}</p>
          </div>
        )}
      </div>

      <div className="mt-8 text-sm text-muted-foreground">
        <p>If you see ✅, Supabase is working correctly!</p>
        <p>If you see ❌, check your environment variables.</p>
      </div>
    </div>
  );
}
