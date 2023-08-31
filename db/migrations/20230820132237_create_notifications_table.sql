-- migrate:up
-------Notification Type Enum------
do $$ begin create type notification_types as enum(
    'new_products_for_followers',
    'purchase_was_made',
    'product_added_to_cart',
    'new_followers_for_sellers'
);
exception
when duplicate_object then null;
end $$;
-----------Create Notifications Table -------------------
create table if not exists notifications (
    id int primary key generated always as identity,
    product_id int,
    "who_to_notify(user_id)" int not null references users (id) on delete cascade on update cascade,
    "who_trigger_notification(user_id)" int not null references users (id) on delete cascade on update cascade,
    notification_type notification_types not null,
    read_by_reciever boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-----------Create Trigger--------
create trigger set_timestamp before
update on notifications for each row execute procedure trigger_set_timestamp();
---------------------------------
-- migrate:down
drop table if exists notifications cascade;