import { defaultProfileImage } from '../../common/utils/constantStrings.json';
import { randomQuote } from '../../common/app/utils/get-words';
import { cachedMap } from '../utils/map';
// import NewsFeed from '../rss';

// const news = new NewsFeed();

module.exports = function(app, done) {
  const { About } = app.models;
  const router = app.loopback.Router();
  let challengeCount = 0;

  if (!process.env.SEEDING) {
    cachedMap(app.models)
      .do(({ entities: { challenge } }) => {
        challengeCount = Object.keys(challenge).length;
      })
      .subscribe(
        () => {},
        err => {throw new Error(err);},
        () => {
          router.get('/', addDefaultImage, index);
          app.use(router);
          done();
        }
      );
  }

  function addDefaultImage(req, res, next) {
    if (!req.user || req.user.picture) {
      return next();
    }
    return req.user.update$({ picture: defaultProfileImage })
    .subscribe(
      () => next(),
      next
    );
  }

  function index(req, res) {
    const { user } = req;
    const homePage = user ? 'userHome' : 'noUserHome';
    const { quote, author} = randomQuote();
    const title = user ?
      `Welcome, ${user.name ? user.name : 'Camper'}!` :
      'Learn to Code and Help Nonprofits';
    const completedChallengeCount = user && user.completedChallengeCount || 0;
    const completedProjectCount = user && user.completedProjectCount || 0;
    const completedCertCount = user && user.completedCertCount || 0;
    const completedLegacyCertCount = user && user.completedLegacyCertCount || 0;
    Promise.all([
      // news.getFeed(),
      About.getActiveUsersForRendering()
    ])
    .then(([
      // feed,
      activeUsers
    ]) => {
      return res.render(
        homePage, {
          activeUsers,
          author,
          challengeCount,
          completedChallengeCount,
          completedProjectCount,
          completedCertCount,
          completedLegacyCertCount,
          // feed,
          quote,
          title
        });
      });
      }
};
