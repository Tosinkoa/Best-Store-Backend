-- migrate:up
create schema if not exists hidden;
create unlogged table if not exists hidden.session (
    sid text primary key not null,
    sess json not null,
    expire timestamptz not null
);
-- migrate:down
drop schema if exists hidden;
drop table if exists session;