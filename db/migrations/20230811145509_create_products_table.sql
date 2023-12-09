-- migrate:up
-------User Role Enum-----
do $$ begin create type product_status as enum('public', 'hidden');
exception
when duplicate_object then null;
end $$;

create table if not exists products (
    id int primary key generated always as identity,
    seller_id int not null references sellers (id) on delete cascade on update cascade,
    name varchar not null,
    description text not null,
    price float not null,
    crossed_out_price float,
    category_id int not null references categories (id) on delete cascade on update cascade,
    sub_category_id int not null references sub_categories (id) on delete cascade on update cascade,
    status product_status not null default 'public',
    bargain boolean default false,
    in_stock int,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

CREATE INDEX idx_sub_category_id ON products (sub_category_id);
CREATE INDEX idx_name ON products (name);

-----------Create Trigger--------
create trigger set_timestamp before
update on products for each row execute procedure trigger_set_timestamp();
---------------------------------
-- migrate:down
drop table if exists products cascade;