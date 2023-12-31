-- migrate:up
-------Notification Type Enum------
exception
when duplicate_object then null;
end $$;
-----------Create Notifications Table -------------------
create table if not exists notifications (
    id int primary key generated always as identity,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-----------Create Trigger--------
create trigger set_timestamp before
update on notifications for each row execute procedure trigger_set_timestamp();
---------------------------------
-- migrate:down
drop table if exists notifications cascade;