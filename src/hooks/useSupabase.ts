
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { toast } from "@/hooks/use-toast";

// Generic type for fetch results
interface FetchResult<T> {
  data: T[] | null;
  error: Error | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

// Custom hook for fetching data from Supabase
export function useSupabaseFetch<T>(
  tableName: string,
  options?: {
    columns?: string;
    filters?: { column: string; value: any; operator?: string }[];
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    dependencies?: any[];
  }
): FetchResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Start building the query
      let query = supabase
        .from(tableName)
        .select(options?.columns || "*");
      
      // Apply filters
      if (options?.filters && options.filters.length > 0) {
        options.filters.forEach((filter) => {
          const { column, value, operator = "eq" } = filter;
          
          // Apply the appropriate filter based on the operator
          switch (operator) {
            case "eq":
              query = query.eq(column, value);
              break;
            case "neq":
              query = query.neq(column, value);
              break;
            case "gt":
              query = query.gt(column, value);
              break;
            case "lt":
              query = query.lt(column, value);
              break;
            case "gte":
              query = query.gte(column, value);
              break;
            case "lte":
              query = query.lte(column, value);
              break;
            case "ilike":
              query = query.ilike(column, `%${value}%`);
              break;
            case "in":
              query = query.in(column, Array.isArray(value) ? value : [value]);
              break;
            default:
              query = query.eq(column, value);
          }
        });
      }
      
      // Apply order by
      if (options?.orderBy) {
        const { column, ascending = true } = options.orderBy;
        query = query.order(column, { ascending });
      }
      
      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      // Execute the query
      const { data: result, error: queryError } = await query;
      
      if (queryError) {
        throw queryError;
      }
      
      setData(result as T[]);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err as Error);
      setData(null);
      
      toast({
        title: "Error fetching data",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, options?.dependencies || []);

  const refetch = fetchData;

  return { data, error, loading, refetch };
}

// Hook for inserting data into Supabase
export function useSupabaseInsert<T>(tableName: string) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const insertData = async (data: Partial<T>, options?: { onSuccess?: () => void }): Promise<T | null> => {
    try {
      setLoading(true);
      
      const { data: result, error: insertError } = await supabase
        .from(tableName)
        .insert(data)
        .select();
      
      if (insertError) {
        throw insertError;
      }
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
      
      toast({
        title: "Success",
        description: "Data added successfully",
      });
      
      setError(null);
      return result?.[0] as T || null;
    } catch (err) {
      console.error("Error inserting data:", err);
      setError(err as Error);
      
      toast({
        title: "Error adding data",
        description: (err as Error).message,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { insertData, loading, error };
}

// Hook for updating data in Supabase
export function useSupabaseUpdate<T>(tableName: string) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const updateData = async (
    id: string,
    data: Partial<T>,
    options?: { onSuccess?: () => void }
  ): Promise<T | null> => {
    try {
      setLoading(true);
      
      const { data: result, error: updateError } = await supabase
        .from(tableName)
        .update(data)
        .eq("id", id)
        .select();
      
      if (updateError) {
        throw updateError;
      }
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
      
      toast({
        title: "Success",
        description: "Data updated successfully",
      });
      
      setError(null);
      return result?.[0] as T || null;
    } catch (err) {
      console.error("Error updating data:", err);
      setError(err as Error);
      
      toast({
        title: "Error updating data",
        description: (err as Error).message,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateData, loading, error };
}

// Hook for deleting data from Supabase
export function useSupabaseDelete(tableName: string) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteData = async (
    id: string,
    options?: { onSuccess?: () => void }
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
      
      toast({
        title: "Success",
        description: "Data deleted successfully",
      });
      
      setError(null);
      return true;
    } catch (err) {
      console.error("Error deleting data:", err);
      setError(err as Error);
      
      toast({
        title: "Error deleting data",
        description: (err as Error).message,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteData, loading, error };
}

// Hook for getting a single item by ID
export function useSupabaseGetById<T>(
  tableName: string,
  id: string | undefined,
  options?: {
    columns?: string;
    dependencies?: any[];
    enabled?: boolean;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    // Skip if id is undefined or explicitly disabled
    if (!id || options?.enabled === false) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { data: result, error: queryError } = await supabase
        .from(tableName)
        .select(options?.columns || "*")
        .eq("id", id)
        .single();
      
      if (queryError) {
        throw queryError;
      }
      
      setData(result as T);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${tableName} by ID:`, err);
      setError(err as Error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ...(options?.dependencies || [])]);

  const refetch = fetchData;

  return { data, error, loading, refetch };
}
