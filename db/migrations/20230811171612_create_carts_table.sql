-- migrate:up
create table if not exists carts (
    id int primary key generated always as identity,
    product_id int not null references products (id) on delete cascade on update cascade,
    product_count int not null,
    user_id int not null references users (id) on delete cascade on update cascade,
    created_at timestamptz not null default now (),
    updated_at timestamptz not null default now ()
);
-----------Create Trigger--------
create trigger set_timestamp before
update on carts for each row execute procedure trigger_set_timestamp();
---------------------------------
-- migrate:down
drop table if exists carts cascade;