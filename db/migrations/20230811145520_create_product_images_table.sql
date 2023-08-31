-- migrate:up
create table if not exists product_images (
    id int primary key generated always as identity,
    product_id int not null references products (id) on delete cascade on update cascade,
    images text [] not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-----------Create Trigger--------
create trigger set_timestamp before
update on product_images for each row execute procedure trigger_set_timestamp();
---------------------------------
-- migrate:down
drop table if exists product_images cascade;