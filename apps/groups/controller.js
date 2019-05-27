const BaseController = require('../../src/js/common/BaseController.js');

const Groups = require('../../src/models/groups.js');
const Items = require('../../src/models/items.js');

const config = require('./config.json');

class GroupController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      groups: new Groups(),
      items: new Items(),
    };
  }

  getRoot(req, res) {
    this.models.groups.getAll()
      .then(groups => {
        res.render('index', { groups });
      });
  }

  getCreate(req, res) {
    res.render('create', { group: {} });
  }

  postCreate(req, res) {
    if (req.body.name == '') {
      this.displayError(req, res, '', this.getRoute('/create'), 'The group requires a name');
    }

    const group = {
      name: req.body.name
    }

    if (req.body.limiter) group.limiter = req.body.limiter;
    if (req.body.duration) group.duration = req.body.duration;

    this.models.groups.create(group)
      .then(id => {
        req.flash( 'success', 'Group created' );
        req.saveSessionAndRedirect(this.getRoute());
      })
      .catch(err => this.displayError(req, res, err, this.getRoute(), 'Error creating group - '));
  }

  getEdit(req, res) {
    this.models.groups.getById(req.params.id)
      .then(group => {
        if (!group) {
          throw new Error('Could not find group');
        } else {
          res.render('edit', { group });
        }
      })
      .catch(err => this.displayError(req, res, err))
  }

  postEdit(req, res) {
    if (req.body.name == '') {
      this.displayError(req, res, '', this.getRoute('/edit'), 'The group requires a name');
    }

    const group = {
      name: req.body.name,
      limiter: req.body.limiter ? req.body.limiter : null,
      duration: req.body.duration ? req.body.duration : null
    };

    this.models.groups.update(req.params.id, group)
      .then(id => {
        req.flash( 'success', 'Group updated' );
        req.saveSessionAndRedirect(this.getRoute());
      })
      .catch(err => {
        this.displayError(
          req,
          res,
          err,
          this.getRoute([`/${req.params.id}`, '/edit']),
          'Error updating the group - '
        );
      })
  }

  getRemove(req, res) {
    this.models.groups.getAll()
      .then(groups => {
        const selected = groups.find(i => i.id === parseInt(req.params.id, 10));

        if (!selected) {
          throw new Error('Group not found');
        }

        const list = groups.map(group => {
          if (group.id == req.params.id) {
            return Object.assign({}, group, {
              disabled: true
            });
          }

          return group;
        });

        res.render('confirm-remove', {
          selected,
          groups: list
        });
      })
      .catch(err => this.displayError(req, res, err, this.getRoute()));
  }

  /**
   * Endpoint for removing a group and optionally
   * transferring the items to a new group
   *
   * @param {Object} req Express request object
   * @param {Object} res Express response object
   */
  postRemove(req, res) {
    let removeId;
    this.models.groups.getById(req.params.id)
      .then(groupToRemove => {
        if (!groupToRemove) {
          throw new Error('Group not found');
        }

        removeId = groupToRemove.id;

        if (req.body.group) {
          return this.models.groups.query().getById(parseInt(req.body.group, 10))
            .then(groupToBecome => {
              if (!groupToBecome) {
                throw new Error('New group not found');
              }

              return this.models.items.updateGroup(groupToRemove.id, groupToBecome.id)
            });
        } else {
          return this.models.items.updateGroup(groupToRemove.id, null);
        }
      })
      .then(() => {
        return this.models.groups.remove(removeId)
      })
      .then(() => {
        req.flash('success', 'Group deleted and items transferred');
        req.saveSessionAndRedirect(this.getRoute());
      })
      .catch(err => this.displayError(req, res, err, this.getRoute(), 'Error removing - '));
  }
}

module.exports = GroupController;
