-----Trigger Function-----
create or replace function trigger_set_timestamp() returns trigger as $$ begin new.updated_at = now();
return new;
end;
$$ language plpgsql;
-- migrate:up
create table if not exists verify_otp_token (
    id int primary key generated always as identity,
    token text unique not null,
    user_id integer not null references users(id) on delete cascade on update cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-----------Create Trigger--------
create trigger set_timestamp before
update on verify_otp_token for each row execute procedure trigger_set_timestamp();

-- migrate:down
drop table if exists verify_otp_token cascade;
