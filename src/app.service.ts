import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs';
import { Octokit } from '@octokit/rest';
import { readFileSync } from 'fs';
import { clientId, clientSecret, owner } from './common/configuration';


@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  async getAccessToken(code: string): Promise<string> {
    var url: string = 'https://github.com/login/oauth/access_token';

    try {
      var resp = await firstValueFrom(this.httpService.post(url, 
        {
          client_id: clientId, 
          code: code, 
          client_secret: clientSecret,
        }, 
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
          }
        }
      ));
  
      return resp.data.access_token;
    } catch(err) {
      console.error(err);

      return undefined;
    }

    
  }

  async createRepoUtil(accessToken: string): Promise<any> {
    var url: string = 'https://api.github.com/user/repos';
    var repoName = 'sample-octokit-repo-5247';

    try {
      var resp = await firstValueFrom(this.httpService.post(url, 
        {
          name: repoName,
          description: 'Sample Repo created using Octokit',
          private: false,
        }, 
        {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${accessToken}`,
            "X-GitHub-Api-Version": "2022-11-28",
          }
        }
      ));

      return { success: true, repo: resp.data.repo };
    } catch (err) {
      if (err.response.data.errors[0].message == 'name already exists on this account') {
        return { success: true, repo: repoName };
      }

      console.error(err);
      return { success: false };
    }
  }

  async addSampleFiles(accessToken: string, repo: string): Promise<boolean> {
    try {
      const octokit = new Octokit({
        auth: accessToken,
      });

      let x = Math.random() * 1000000;

      const content = readFileSync("./input.txt", "utf-8");
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
}
