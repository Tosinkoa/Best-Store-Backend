-- migrate:up
create table if not exists sellers (
    id int primary key generated always as identity,
    user_id int not null unique references users (id) on delete cascade on update cascade,
    business_name varchar unique not null,
    business_logo text not null,
    business_logo_key text unique not null,
    about text not null,
    state varchar not null,
    city varchar not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

CREATE INDEX idx_business_name ON sellers (business_name);
-----------Create Trigger--------
create trigger set_timestamp before
update on sellers for each row execute procedure trigger_set_timestamp();
---------------------------------
-- migrate:down
drop table if exists sellers cascade;