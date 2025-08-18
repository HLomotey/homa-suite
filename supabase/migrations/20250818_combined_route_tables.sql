-- Create combined_route_routes table for linking combined routes with individual routes
CREATE TABLE IF NOT EXISTS public.combined_route_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    combined_route_id UUID NOT NULL REFERENCES public.combined_routes(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES public.routes(id),
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(combined_route_id, route_id)
);

-- Add RLS policies for combined_route_routes
ALTER TABLE public.combined_route_routes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to select combined_route_routes
CREATE POLICY "Allow authenticated users to select combined_route_routes"
ON public.combined_route_routes
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow authenticated users to insert combined_route_routes
CREATE POLICY "Allow authenticated users to insert combined_route_routes"
ON public.combined_route_routes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update combined_route_routes
CREATE POLICY "Allow authenticated users to update combined_route_routes"
ON public.combined_route_routes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to delete combined_route_routes
CREATE POLICY "Allow authenticated users to delete combined_route_routes"
ON public.combined_route_routes
FOR DELETE
TO authenticated
USING (true);

-- Add comment to the table
COMMENT ON TABLE public.combined_route_routes IS 'Junction table linking combined routes with individual routes';
