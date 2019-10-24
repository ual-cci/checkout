
exports.seed = function(knex) {
	// Deletes ALL existing entries
	return knex('permissions').del()
		.then(function() {
			return knex('roles').where({
				name: 'Super Admin'
		 }).first('id')
	 }).then(function(role) {
			// Inserts seed entries
			return knex('permissions').insert([
				{role_id: role.id, permission:'edit_profile'},
				{role_id: role.id, permission:'print'},
				{role_id: role.id, permission:'view_reports'},
				{role_id: role.id, permission:'checkout_issue'},
				{role_id: role.id, permission:'checkout_return'},
				{role_id: role.id, permission:'checkout_audit'},
				{role_id: role.id, permission:'checkout_history'},
				{role_id: role.id, permission:'items_read'},
				{role_id: role.id, permission:'items_history'},
				{role_id: role.id, permission:'items_create'},
				{role_id: role.id, permission:'items_generate'},
				{role_id: role.id, permission:'items_edit'},
				{role_id: role.id, permission:'items_multi_edit'},
				{role_id: role.id, permission:'items_remove'},
				{role_id: role.id, permission:'groups_read'},
				{role_id: role.id, permission:'groups_create'},
				{role_id: role.id, permission:'groups_edit'},
				{role_id: role.id, permission:'groups_remove'},
				{role_id: role.id, permission:'groups_override'},
				{role_id: role.id, permission:'locations_read'},
				{role_id: role.id, permission:'locations_create'},
				{role_id: role.id, permission:'locations_edit'},
				{role_id: role.id, permission:'locations_remove'},
				{role_id: role.id, permission:'departments_read'},
				{role_id: role.id, permission:'departments_create'},
				{role_id: role.id, permission:'departments_edit'},
				{role_id: role.id, permission:'departments_remove'},
				{role_id: role.id, permission:'users_read'},
				{role_id: role.id, permission:'users_create'},
				{role_id: role.id, permission:'users_edit'},
				{role_id: role.id, permission:'users_reset_password_attempts'},
				{role_id: role.id, permission:'users_change_password'},
				{role_id: role.id, permission:'users_change_role'},
				{role_id: role.id, permission:'users_history'},
				{role_id: role.id, permission:'users_remove'},
				{role_id: role.id, permission:'users_multi_edit'},
				{role_id: role.id, permission:'courses_read'},
				{role_id: role.id, permission:'courses_create'},
				{role_id: role.id, permission:'courses_edit'},
				{role_id: role.id, permission:'courses_remove'},
				{role_id: role.id, permission:'years_read'},
				{role_id: role.id, permission:'years_create'},
				{role_id: role.id, permission:'years_edit'},
				{role_id: role.id, permission:'years_remove'},
				{role_id: role.id, permission:'printers_read'},
				{role_id: role.id, permission:'printers_create'},
				{role_id: role.id, permission:'printers_edit'},
				{role_id: role.id, permission:'printers_remove'},
				{role_id: role.id, permission:'roles_read'},
				{role_id: role.id, permission:'roles_create'},
				{role_id: role.id, permission:'roles_edit'},
				{role_id: role.id, permission:'roles_remove'},
				{role_id: role.id, permission:'roles_set_permissions'},
				{role_id: role.id, permission:'reservations_read'},
				{role_id: role.id, permission:'reservations_create'},
				{role_id: role.id, permission:'reservations_edit'},
				{role_id: role.id, permission:'reservations_remove'},
				{role_id: role.id, permission:'reservations_override'},
			])
	})
}
