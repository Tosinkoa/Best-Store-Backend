-- migrate:up
create table if not exists product_purchases (
    id int primary key generated always as identity,
    transaction_id int not null references transactions (id) on delete cascade on update cascade,
    product_id int not null references products (id),
    product_count int not null,
    seller_id int not null references sellers (id),
    -- metadata text [],
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-----------Create Trigger--------
create trigger set_timestamp before
update on product_purchases for each row execute procedure trigger_set_timestamp();
---------------------------------
-- migrate:down
drop table if exists product_purchases cascade;