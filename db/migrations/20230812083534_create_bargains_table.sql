-- migrate:up
create table if not exists bargains (
    id int primary key generated always as identity,
    product_id int not null references products (id) on delete cascade on update cascade,
    user_id int not null references users (id) on delete cascade on update cascade,
    accepted boolean not null default false,
    amount int not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-----------Create Trigger--------
create trigger set_timestamp before
update on bargains for each row execute procedure trigger_set_timestamp();
---------------------------------
-- migrate:down
drop table if exists bargains cascade;