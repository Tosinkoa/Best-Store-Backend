-- migrate:up
-------Notification Type Enum------
exception
when duplicate_object then null;
end $$;
-----------Create add_to_cart_notifications Table -------------------
create table if not exists add_to_cart_notifications (
    id int primary key generated always as identity,
    "triggered_by(user_id)" int not null unique references users (id),
    "receiver(user_id)" int not null unique references users (id),
    read_at timestamptz,
    cart_id int not null unique references products (id), 
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-----------Create Trigger--------
create trigger set_timestamp before
update on add_to_cart_notifications for each row execute procedure trigger_set_timestamp();
---------------------------------
-- migrate:down
drop table if exists add_to_cart_notifications cascade;