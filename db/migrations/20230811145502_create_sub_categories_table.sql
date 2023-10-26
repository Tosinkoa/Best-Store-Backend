-- migrate:up
create table if not exists sub_categories (
    id int primary key generated always as identity,
    category_id int not null references categories (id) on delete cascade on update cascade,
    sub_cat_names varchar not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-----------Create Trigger--------
create trigger set_timestamp before
update on sub_categories for each row execute procedure trigger_set_timestamp();
---------------------------------
-- migrate:down
drop table if exists sub_categories cascade;