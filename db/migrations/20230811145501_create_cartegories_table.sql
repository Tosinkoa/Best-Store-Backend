-- migrate:up
create table if not exists cartegories (
    id int primary key generated always as identity,
    name varchar not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-----------Create Trigger--------
create trigger set_timestamp before
update on cartegories for each row execute procedure trigger_set_timestamp();
---------------------------------
-- migrate:down
drop table if exists cartegories cascade;