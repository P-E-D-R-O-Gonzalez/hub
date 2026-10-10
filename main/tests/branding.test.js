import test from 'node:test';
import assert from 'node:assert/strict';
import { readBranding } from '../src/lib/branding.ts';
test('branding supports uploads and clearing images to restore defaults',()=>{
 assert.deepEqual(readBranding({logo:'/uploads/city logo.png',favicon:'/uploads/icon.svg',logo_alt:' City '}),{logo:'/uploads/city logo.png',favicon:'/uploads/icon.svg',logoAlt:'City'});
 assert.deepEqual(readBranding({logo:null,favicon:'',logo_alt:'City'}),{logo:'',favicon:'',logoAlt:'City'});
});
test('branding rejects unsupported images, external URLs and missing accessible descriptions',()=>{
 for(const path of ['//example.com/a.png','https://example.com/a.png','/../a.png','/uploads/a.html','/uploads/a.png?x=1']) assert.throws(()=>readBranding({logo:path,logo_alt:'City'}),/Branding/);
 assert.throws(()=>readBranding({favicon:'/uploads/icon.jpg',logo_alt:'City'}),/Branding/);
 assert.throws(()=>readBranding({logo:'/uploads/logo.png',logo_alt:' '}),/description/);
});
