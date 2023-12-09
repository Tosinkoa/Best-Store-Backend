-- migrate:up
create table if not exists transactions (
    id int primary key generated always as identity,
    user_id int not null references users (id),
    tx_ref text unique not null,
    amount int not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-----------Create Trigger--------
create trigger set_timestamp before
update on transactions for each row execute procedure trigger_set_timestamp();
---------------------------------
-- migrate:down
drop table if exists transactions cascade;