-- migrate:up
-----Trigger Function-----
create or replace function trigger_set_timestamp() returns trigger as $$ begin new.updated_at = now();
return new;
end;
$$ language plpgsql;
-------User Role Enum------
do $$ begin create type user_role as enum('buyer', 'seller', 'moderator', 'admin', 'block');
exception
when duplicate_object then null;
end $$;
------Create Citext Ext & users Table-------
create extension if not exists citext;
create table if not exists users (
    id int primary key generated always as identity,
    first_name varchar not null,
    last_name varchar not null,
    email citext unique not null,
    profile_picture text,
    profile_picture_key text unique,
    phone_number text unique,
    role user_role not null default 'buyer',
    password varchar not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-----------Create Trigger--------
create trigger set_timestamp before
update on users for each row execute procedure trigger_set_timestamp();
---------------------------------
-- migrate:down
drop table if exists users cascade;
drop type user_role;