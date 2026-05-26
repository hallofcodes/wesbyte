/*
  # Website Builder Platform Schema

  1. New Tables
    - `websites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text)
      - `slug` (text, unique)
      - `pages` (jsonb, stores page structure)
      - `settings` (jsonb, stores global settings like colors, fonts)
      - `is_published` (boolean)
      - `custom_domain` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `website_versions`
      - `id` (uuid, primary key)
      - `website_id` (uuid, references websites)
      - `version` (integer)
      - `pages` (jsonb)
      - `settings` (jsonb)
      - `created_at` (timestamp)
      - `description` (text, describes what changed)
    
    - `templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `pages` (jsonb)
      - `settings` (jsonb)
      - `preview_image` (text, URL)
      - `is_premium` (boolean)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users, nullable)
    
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique)
      - `theme` (text, default 'light')
      - `preferences` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own websites and settings
    - Templates are readable by all authenticated users
*/

-- Websites table
CREATE TABLE IF NOT EXISTS websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'Untitled Website',
  description text DEFAULT '',
  slug text UNIQUE DEFAULT gen_random_uuid()::text,
  pages jsonb DEFAULT '[]'::jsonb,
  settings jsonb DEFAULT '{"colors":{"primary":"#3b82f6","secondary":"#64748b","accent":"#06b6d4","background":"#ffffff","foreground":"#0f172a"},"fonts":{"heading":"Inter","body":"Inter","mono":"monospace"},"theme":"light"}'::jsonb,
  is_published boolean DEFAULT false,
  custom_domain text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Website versions table (for undo/redo and history)
CREATE TABLE IF NOT EXISTS website_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id uuid REFERENCES websites(id) ON DELETE CASCADE NOT NULL,
  version integer NOT NULL,
  pages jsonb NOT NULL,
  settings jsonb NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(website_id, version)
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'general',
  pages jsonb NOT NULL,
  settings jsonb NOT NULL,
  preview_image text,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  theme text DEFAULT 'light',
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Websites policies
CREATE POLICY "Users can view their own websites"
  ON websites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own websites"
  ON websites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own websites"
  ON websites FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own websites"
  ON websites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Website versions policies
CREATE POLICY "Users can view versions of their websites"
  ON website_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = website_versions.website_id
      AND websites.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions for their websites"
  ON website_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = website_versions.website_id
      AND websites.user_id = auth.uid()
    )
  );

-- Templates policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view templates"
  ON templates FOR SELECT
  TO authenticated
  USING (true);

-- User settings policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);
CREATE INDEX IF NOT EXISTS idx_website_versions_website_id ON website_versions(website_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for websites
CREATE TRIGGER update_websites_updated_at
  BEFORE UPDATE ON websites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_settings
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
