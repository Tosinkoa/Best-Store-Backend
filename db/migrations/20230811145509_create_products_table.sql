-- migrate:up
create table if not exists products (
    id int primary key generated always as identity,
    seller_id int not null references sellers (id) on delete cascade on update cascade,
    name varchar not null,
    description text not null,
    brand varchar,
    price float not null,
    crossed_out_price float,
    cartegory citext not null,
    sub_cartegory citext,
    bargain boolean not null default false,
    in_stock int,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-----------Create Trigger--------
create trigger set_timestamp before
update on products for each row execute procedure trigger_set_timestamp();
---------------------------------
-- migrate:down
drop table if exists products cascade;