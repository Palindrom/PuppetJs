import Palindrom from '../../src/palindrom';
import moxios from 'moxios';
import assert from 'assert';
import { sleep } from '../utils';

describe('Palindrom', () => {
    describe('#ignore by defineProperty', () => {
        beforeEach(() => {
            moxios.install();
        });
        afterEach(() => {
            moxios.uninstall();
        });
        it('Should not send patches for non-enumerable properties', async () => {
            moxios.stubRequest('http://localhost/testURL', {
                status: 200,
                location: 'http://localhost/testURL/patch-server',
                headers: { contentType: 'application/json' },
                responseText: '{"hello": "world"}'
            });
            const palindrom = new Palindrom({
                remoteUrl: 'http://localhost/testURL'
            });
            let obj;
            palindrom.addEventListener('state-reset', ev => {
                obj = ev.detail;
            });
            await sleep();
            assert(moxios.requests.count() === 1);
            // a change that emits a patch
            obj.newProp = 'name';

            // wait for ajax
            await sleep();
            assert(moxios.requests.count() === 2);

            // a change that does not emit
            Object.defineProperty(obj, 'ignored', {
                enumerable: false,
                value: {
                    child: 1
                }
            });

            // a change that does not emit
            obj.ignored.child = 2;

            // wait for ajax
            await sleep();
            // no further requests
            assert(moxios.requests.count() === 2);
        });
    });
});
