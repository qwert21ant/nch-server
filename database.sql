create table if not exists tasks (
	id			integer primary key,
	author		integer,
	reviewer	integer,
	resubmits	integer,
	answers		text
);

create table if not exists users (
	id		serial primary key,
	name	varchar(100),
	role	varchar(100),
	key		varchar(100)
);

create user nch
	PASSWORD 'lapopa228'
;

grant select, insert, update, delete
	on tasks, users
	to nch
;

grant usage
	on users_id_seq
	to nch
;