-- migrate:up
create table if not exists sub_cartegories (
    id int primary key generated always as identity,
    cartegory_id int not null references cartegories (id) on delete cascade on update cascade,
    sub_cart_names varchar not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-----------Create Trigger--------
create trigger set_timestamp before
update on sub_cartegories for each row execute procedure trigger_set_timestamp();
---------------------------------
-- migrate:down
drop table if exists sub_cartegories cascade;