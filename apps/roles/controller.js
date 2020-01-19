const BaseController = require('../../src/js/common/BaseController.js')

const Roles = require('../../src/models/roles.js')
const Users = require('../../src/models/users.js')
const Permissions = require('../../src/models/permissions.js')

const url = require('url')

const all_permissions = require('./all_permissions.json')
const flat_all_permissions = Object.keys(all_permissions)
const config = require('./config.json')

class RoleController extends BaseController {
	constructor() {
		super({path: config.path})

		this.models = {
			roles: new Roles(),
			users: new Users(),
			permissions: new Permissions()
		}
	}

	getRoot(req, res) {
		this.models.roles.getAll()
		.then(roles => {
			res.render('index', {roles})
		})
	}

	getCreate(req, res) {
		res.render('create', {role: {}})
	}

	postCreate(req, res) {
		if (req.body.name == '') {
			return this.displayError(req, res, '', this.getRoute('/create'), 'The role requires a name')
		}

		if (req.body.home == '') {
			return this.displayError(req, res, '', this.getRoute('/create'), 'The role requires a home')
		}

		if (req.body.home.charAt(0) != '/') {
			return this.displayError(req, res, '', this.getRoute('/create'), 'The home must be a relative path')
		}

		if (req.body.home.length == 1) {
			return this.displayError(req, res, '', this.getRoute('/create'), 'This path would cause a redirect loop')
		}

		const role = {
			name: req.body.name,
			home: req.body.home
		}

		this.models.roles.create(role)
		.then(id => {
			req.flash('success', 'Role created')
			req.saveSessionAndRedirect(this.getRoute())
		})
		.catch(err => this.displayError(req, res, err, this.getRoute(), 'Error creating role - '))
	}

	getEdit(req, res) {
		this.models.roles.getById(req.params.id)
			.then(role => {
				if (!role) {
					throw new Error('Could not find role')
				} else {
					res.render('edit', {role})
				}
			})
			.catch(err => this.displayError(req, res, err))
	}

	postEdit(req, res) {
		if (req.body.name == '') {
			return this.displayError(req, res, '', this.getRoute(`/${req.params.id}/edit`), 'The role requires a name')
		}

		if (req.body.home == '') {
			return this.displayError(req, res, '', this.getRoute(`/${req.params.id}/edit`), 'The role requires a home')
		}

		if (req.body.home.charAt(0) != '/') {
			return this.displayError(req, res, '', this.getRoute(`/${req.params.id}/edit`), 'The home must be a relative path')
		}

		if (req.body.home.length == 1) {
			return this.displayError(req, res, '', this.getRoute(`/${req.params.id}/edit`), 'This path would cause a redirect loop')
		}

		const role = {
			name: req.body.name,
			home: req.body.home
		}

		this.models.roles.update(req.params.id, role)
		.then(id => {
			req.flash('success', 'Role updated')
			req.saveSessionAndRedirect(this.getRoute())
		})
		.catch(err => {
			this.displayError(
				req,
				res,
				err,
				this.getRoute([`/${req.params.id}`, '/edit']),
				'Error updating the role - '
			)
		})
	}

	getPermissions(req, res) {
		Promise.all([
			this.models.roles.getById(req.params.id),
			this.models.permissions.getByRoleId(req.params.id)
		])
		.then(([role, permissions]) => {
			if (!role) {
				throw new Error('Could not find role')
			} else {
				var selected_perms = permissions.map(p => {
					return p.permission
				})
				res.render('permissions', {role, selected_perms, permissions, all_permissions})
			}
		})
		.catch(err => this.displayError(req, res, err))
	}

	postPermissions(req, res) {
		if (req.body.permissions && ! Array.isArray(req.body.permissions)) {
			req.body.permissions = [req.body.permissions]
		}

		var permissions = []
		this.models.permissions.removeRole(req.params.id)
		.then(() => {
			for (let i = 0; i < req.body.permissions.length; i++) {
				if (flat_all_permissions.includes(req.body.permissions[i])) {
					let permission = {
						role_id:req.params.id,
						permission: req.body.permissions[i]
					}
					permissions.push(permission)
				}
			}
		})
		.then(() => {
			this.models.permissions.create(permissions)
				.then(result => {
					req.flash('success', 'Permissions set')
					req.saveSessionAndRedirect(this.getRoute())
				})
				.catch(err => this.displayError(req, res, err, this.getRoute()))
		})
	}

	getRemove(req, res) {
		this.models.roles.getAll()
		.then(roles => {
			const selected = roles.find(i => i.id === parseInt(req.params.id, 10))

			if (!selected) {
				throw new Error('Role not found')
			}

			const list = roles.map(role => {
				if (role.id == req.params.id) {
					return Object.assign({}, role, {
						disabled: true
					})
				}

				return role
			})

			res.render('confirm-remove', {
				selected,
				roles: list
			})
		})
		.catch(err => this.displayError(req, res, err, this.getRoute()))
	}

	/**
	* Endpoint for removing a role and optionally
	* transferring the items to a new role
	*
	* @param {Object} req Express request object
	* @param {Object} res Express response object
	*/
	postRemove(req, res) {
		let removeId
		this.models.roles.getById(req.params.id)
		.then(roleToRemove => {
			if (!roleToRemove) {
				throw new Error('Role not found')
			}

			removeId = roleToRemove.id

			if (req.body.role) {
				return this.models.roles.query().getById(parseInt(req.body.role, 10))
					.then(roleToBecome => {
						if (!roleToBecome) {
							throw new Error('New role not found')
						}

						return this.models.users.updateRole(roleToRemove.id, roleToBecome.id)
					})
			} else {
				return this.models.users.updateRole(roleToRemove.id, null)
			}
		})
		.then(() => {
			return this.models.permissions.removeRole(removeId)
		})
		.then(() => {
			return this.models.roles.remove(removeId)
		})
		.then(() => {
			req.flash('success', 'Role and permissions deleted and users transferred')
			req.saveSessionAndRedirect(this.getRoute())
		})
		.catch(err => this.displayError(req, res, err, this.getRoute(), 'Error removing - '))
	}
}

module.exports = RoleController
