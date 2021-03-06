import nock from 'nock';

import getCompareCommitsResponse from '../../__mocks__/scenarios/get_compare_commits.json';

const GITHUB_URL = 'https://api.github.com';
export type CallbackRequest = (
  _uri: string,
  body: { target_url: string; description: string; state: string; context: string },
  cb: (arg0: unknown, arg1: unknown) => void
) => void;
type MockResponse = Record<string, unknown> | Record<string, unknown>[] | CallbackRequest;
type MockRequest = (
  action: 'post' | 'get',
  url: string,
  exitCode: number,
  response: MockResponse,
  times?: number
) => ReturnType<typeof nock>;

type CompareURLInput = { login: string; name: string; base: string; head: string };

const compareURL = (options: CompareURLInput) =>
  `/repos/${options.login}/${options.name}/compare/${options.base}...${options.head}`;

export const mockCompareCommits = (options: CompareURLInput & { response?: MockResponse }): ReturnType<MockRequest> => {
  return mockRequest('get', compareURL(options), 200, options.response || getCompareCommitsResponse);
};
export const mockRequestWithError = (
  action: 'get' | 'post',
  url: string,
  response: string | Record<string, unknown>
): ReturnType<MockRequest> => {
  const client = nock(GITHUB_URL)[action](url).replyWithError(response) as ReturnType<MockRequest>;

  return client;
};
export const mockRequest: MockRequest = (action, url, exitCode, response, times = 1) => {
  const client = nock(GITHUB_URL)[action](url).reply(exitCode, response);

  if (times > 1) {
    for (let i = 1; i < times; i++) {
      client[action](url).reply(exitCode, response);
    }
  }

  return client;
};
