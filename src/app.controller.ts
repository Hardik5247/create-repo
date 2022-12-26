import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { clientId, redirectUri } from './common/configuration';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint: /
   * Homepage that has login via github option
   */
  @Get('')
  home(@Res() res): void {
    var data = {
      message: 'Login Via GitHub',
      buttonText: 'Authorize',
      buttonOnClick: "window.location.href='authorize'",
    };

    res.render('html/index.hbs', data);
  }

  /**
   * Endpoint: /authorize
   * Redirects to github oauth authorization page
   */
  @Get('authorize')
  authorize(@Res() res): void {
    const baseUrl: string = 'https://github.com/login/oauth/authorize';
    var scope = 'public_repo';
    res.redirect(
      encodeURI(
        baseUrl +
          `?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`,
      ),
    );
  }

  /**
   * Endpoint: /create
   * Handles exchanging of code to access_token and creates repository with sample code.
   */
  @Get('create')
  async createRepo(@Req() req, @Res() res): Promise<void> {
    var data = null;

    if (
      req.query.token == undefined ||
      req.query.token == '' ||
      req.query.token == null
    ) {
      var accessToken = await this.appService.getAccessToken(req.query.code);

      if (accessToken == undefined) {
        data = {
          message: 'Error in getting access token',
          buttonText: 'Try Again?',
          buttonOnClick: "window.location.href='authorize'",
        };
      } else {
        data = {
          message: 'Authorized Succesfully',
          accessToken: accessToken,
          buttonText: 'Create Repository',
          buttonOnClick: `window.location.href='create?token=${accessToken}'`,
        };
      }
    } else {
      var respData = await this.appService.createRepoUtil(req.query.token);

      if (respData.success) {
        var isFileAdded = await this.appService.addSampleFiles(
          req.query.token,
          respData.owner,
          respData.repo,
        );

        if (isFileAdded) {
          data = {
            message: 'Added sample code to newly created repository',
            buttonText: 'Goto Login Page',
            buttonOnClick: "window.location.href='/'",
          };
        } else {
          data = {
            message: 'Unable to add sample code to newly created repository',
            buttonText: 'Try Again?',
            buttonOnClick: "window.location.href='authorize'",
          };
        }
      } else {
        data = {
          message: 'Repository Creation Failed',
          buttonText: 'Try Again?',
          buttonOnClick: "window.location.href='authorize'",
        };
      }
    }

    res.render('html/index.hbs', data);
  }
}
