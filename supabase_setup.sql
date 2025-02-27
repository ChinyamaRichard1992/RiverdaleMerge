-- Create messages table if it doesn't exist
create table if not exists messages (
    id bigint generated by default as identity primary key,
    content text not null,
    timestamp timestamptz default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table messages enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Anyone can read messages" on messages;
drop policy if exists "Anyone can insert messages" on messages;

-- Create policies
create policy "Anyone can read messages"
    on messages
    for select
    using (true);

create policy "Anyone can insert messages"
    on messages
    for insert
    with check (true);

-- Drop existing students table
drop table if exists students;

-- Create a table for student data
create table if not exists students (
    id bigint generated by default as identity primary key,
    studentNumber text not null unique,
    name text not null,
    grade int not null,
    term text not null,
    gender text not null,
    timestamp timestamptz default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table students enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Anyone can read students" on students;
drop policy if exists "Anyone can insert students" on students;
drop policy if exists "Anyone can update students" on students;
drop policy if exists "Anyone can delete students" on students;

-- Create policies
create policy "Anyone can read students"
    on students
    for select
    using (true);

create policy "Anyone can insert students"
    on students
    for insert
    with check (true);

create policy "Anyone can update students"
    on students
    for update
    using (true);

create policy "Anyone can delete students"
    on students
    for delete
    using (true);

-- Enable realtime
begin;
    drop publication if exists supabase_realtime;
    create publication supabase_realtime;
commit;

alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table students;
