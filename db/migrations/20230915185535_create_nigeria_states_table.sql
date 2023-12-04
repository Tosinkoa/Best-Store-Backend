-- migrate:up
create table if not exists nigeria_states (
    id int not null,  
    name varchar not null
);

-- migrate:down
drop table if exists nigeria_states_table;
