const express = require('express');
const router = express.Router();
const passport = require('passport');

const liveProjectsController = require('../controllers/liveProjectsController');
const dashboardControllers = require('../controllers/dashboardControllers');
const {isAuthenticated} = require('../helpers/routeHelpers');

/// LIVE PROJECTS ROUTES ///


router.route('/:id')
  //GET request for user's liveprojects page
  .get(isAuthenticated,liveProjectsController.index);

router.route('/:id/liveProjects')
  //GET request for all live projects
  .get(isAuthenticated, liveProjectsController.liveProjects_get)
  //POST request for adding new live project
  .post(isAuthenticated, liveProjectsController.liveProjects_post)


router.route('/:id/liveprojects/:project_id')
  //DELETE request to remove a live project
  .delete(isAuthenticated, liveProjectsController.liveprojects_delete)
  //PUT request to update the status of a live project to complete
  .put(isAuthenticated, liveProjectsController.liveprojects_update)



/// DASHBOARD DATA ROUTES  ///

router.route('/:id/logtime')
  //GET request for all dashboard data
  .get(isAuthenticated, dashboardControllers.dashboardData_get);

router.route('/:id/logtime/:project_id')
  //POST request to add newly logged time
  .post(isAuthenticated, dashboardControllers.dashboardData_post);



module.exports = router;
