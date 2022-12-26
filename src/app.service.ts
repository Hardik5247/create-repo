import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { readFileSync } from 'fs';
import { clientId, clientSecret } from './common/configuration';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Utility function to access github user's access token
   * @param code temporary code returned after user authorizes a github app
   * @returns user's access token
   */
  async getAccessToken(code: string): Promise<string> {
    var url: string = 'https://github.com/login/oauth/access_token';

    try {
      var resp = await firstValueFrom(
        this.httpService.post(
          url,
          {
            client_id: clientId,
            code: code,
            client_secret: clientSecret,
          },
          {
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json;charset=UTF-8',
            },
          },
        ),
      );

      return resp.data.access_token;
    } catch (err) {
      console.error(err);

      return undefined;
    }
  }

  /**
   * Utility function to create a repository (if not already present) in a github account
   * @param accessToken github account access token
   * @returns object containing "success"=true|false and "repo"=repository name if success is true
   */

  async createRepoUtil(accessToken: string): Promise<any> {
    var url: string = 'https://api.github.com/user/repos';
    var repoName = 'sample-octokit-repo-5247';

    try {
      var resp = await firstValueFrom(
        this.httpService.post(
          url,
          {
            name: repoName,
            description: 'Sample Repo created using Octokit',
            private: false,
          },
          {
            headers: {
              Accept: 'application/vnd.github+json',
              Authorization: `Bearer ${accessToken}`,
              'X-GitHub-Api-Version': '2022-11-28',
            },
          },
        ),
      );

      return {
        success: true,
        owner: resp.data.owner.login,
        repo: resp.data.repo,
      };
    } catch (err) {
      if (
        err.response.data.errors[0].message ==
        'name already exists on this account'
      ) {
        const owner = await this.getAuthenticatedUser(accessToken);
        return { success: true, owner: owner, repo: repoName };
      }

      console.error(err);
      return { success: false };
    }
  }

  /**
   * Utility function to add sample code to a authenticated github user's repository
   * @param accessToken github access token
   * @param repo name of repository
   * @param owner user name of owner of repository
   * @returns boolean. true if added else false
   */
  async addSampleFiles(
    accessToken: string,
    owner: string,
    repo: string,
  ): Promise<boolean> {
    try {
      const octokit = new Octokit({
        auth: accessToken,
      });

      let x = Math.random() * 1000000;

      /** input.txt: sample code to add */
      const content = readFileSync('./input.txt', 'utf-8');
      const contentEncoded = Buffer.from(content, 'utf8').toString('base64');

      await octokit.repos.createOrUpdateFileContents({
        owner: owner,
        repo: repo,
        path: `main-${x}.py`,
        message: `feat: Added main-${x}.py programatically`,
        content: contentEncoded,
      });

      return true;
    } catch (err) {
      console.error(err);

      return false;
    }
  }

  /**
   * Utility function to get details of authenticated user
   * @param accessToken github access token
   * @returns string. github user name
   */
  async getAuthenticatedUser(accessToken: string): Promise<string> {
    var url = 'https://api.github.com/user';

    try {
      var resp = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${accessToken}`,
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }),
      );

      return resp.data.login;
    } catch (err) {
      console.error(err);

      return undefined;
    }
  }
}
