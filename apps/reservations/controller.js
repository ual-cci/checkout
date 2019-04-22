const BaseController = require('../../src/js/common/BaseController.js');

const Reservations = require('../../src/models/reservations.js');
const Items = require('../../src/models/items.js');

const config = require('./config.json');

class ReservationController extends BaseController {
  constructor() {
    super({ path: config.path });

    this.models = {
      reservations: new Reservations(),
      items: new Items(),
    };
  }

  getRoot(req, res) {
    this.models.reservations.getAll()
      .then(reservations => {
        res.render('index', { reservations });
      });
  }

  getCreate(req, res) {
    res.render( 'create', { reservations: {} } );
  }

  postCreate(req, res) {
    // if (req.body.name == '') {
    //   this.displayError(req, res, '', this.getRoute('/create'), 'The reservations requires a name');
    // }

    const reservation = {
      name: req.body.name
    }

    // if (req.body.limiter) group.limiter = req.body.limiter;

    this.models.reservation.create(reservation)
      .then(id => {
        req.flash( 'success', 'Reservation created' );
        res.redirect(this.getRoute());
      })
      .catch(err => this.displayError(req, res, err, this.getRoute(), 'Error creating reservation - '));
  }

  getEdit(req, res) {
    this.models.reservations.getById(req.params.id)
      .then(reservation => {
        if (!reservation) {
          throw new Error('Could not find reservation');
        } else {
          res.render('edit', { reservation });
        }
      })
      .catch(err => this.displayError(req, res, err))
  }

  postEdit(req, res) {
    // if (req.body.name == '') {
    //   this.displayError(req, res, '', this.getRoute('/edit'), 'The reservation requires a name');
    // }

    const reservation = {
      // name: req.body.name,
      // limiter: req.body.limiter ? req.body.limiter : null
    };

    this.models.reservation.update(req.params.id, reservation)
      .then(id => {
        req.flash( 'success', 'Reservation updated' );
        res.redirect(this.getRoute());
      })
      .catch(err => {
        this.displayError(
          req,
          res,
          err,
          this.getRoute([`/${req.params.id}`, '/edit']),
          'Error updating the reservation - '
        );
      })
  }

  getRemove(req, res) {
    this.models.reservations.getAll()
      .then(reservations => {
        const selected = reservations.find(i => i.id === parseInt(req.params.id, 10));

        if (!selected) {
          throw new Error('Reservation not found');
        }

        const list = reservations.map(reservation => {
          if (reservation.id == req.params.id) {
            return Object.assign({}, reservation, {
              disabled: true
            });
          }

          return reservation;
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
    this.models.reservations.getById(req.params.id)
      .then(reservationToRemove => {
        if (!reservationToRemove) {
          throw new Error('Reservation not found');
        }

        removeId = reservationToRemove.id;
      })
      .then(() => {
        return this.models.groups.remove(removeId)
      })
      .then(() => {
        req.flash('success', 'Reservation deleted');
        res.redirect(this.getRoute());
      })
      .catch(err => this.displayError(req, res, err, this.getRoute(), 'Error removing - '));
  }
}

module.exports = ReservationController;
