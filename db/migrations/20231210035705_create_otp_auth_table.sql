-- migrate:up
create table if not exists otp_auth (
    id int primary key generated always as identity,
    temp_secret text,
    valid_secret text,
    user_id integer not null references users(id) on delete cascade on update cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-----------Create Trigger--------
create trigger set_timestamp before
update on otp_auth for each row execute procedure trigger_set_timestamp();

-- migrate:down
drop table if exists otp_auth cascade;
