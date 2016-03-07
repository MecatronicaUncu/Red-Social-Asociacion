(function(){

  'use strict';

  ngDescribe({
    name: 'Users factory',
    module: 'linkedEnibApp',
    mock: {
      linkedEnibApp: {
        REMOTE: '',
      }
    },
    inject: ['users','session','$httpBackend'],
    tests: function(deps){

      describe('API',function(){

        it('Methods existance',function(){
          expect(typeof deps.users.signup).toBe('function');
          expect(typeof deps.users.makeFriend).toBe('function');
          expect(typeof deps.users.deleteFriend).toBe('function');
          expect(typeof deps.users.subscribeTo).toBe('function');
          expect(typeof deps.users.unsubscribeFrom).toBe('function');

          expect(typeof deps.users.isFriend).toBe('function');
          expect(typeof deps.users.isRequested).toBe('function');
          expect(typeof deps.users.isDemanded).toBe('function');
          expect(typeof deps.users.isSubscribed).toBe('function');

          expect(typeof deps.users.they).toBe('function');
        });
      });

      describe('Signup',function(){

        var cb;

				beforeEach(function(){
					deps.$httpBackend.whenGET(/.*/).respond(500, 'Error');
					deps.$httpBackend.whenPOST(/.*/).respond(500, 'Error');

					deps.http.flush();

          cb = jasmine.createSpy('cb');
        });

        it('Should callback error if error on signup',function(){
          deps.users.signup({},cb);

          deps.http.flush();

          expect(cb).toHaveBeenCalledWith(jasmine.any(String),null);
          expect(cb).not.toHaveBeenCalledWith(jasmine.anything(),jasmine.anything());
        });

        it('Should callback error if error on signup - 2',function(){
          deps.$httpBackend.expectPOST('/signup').respond({ idNEO: null });
          deps.users.signup({},cb);

          deps.http.flush();

          expect(cb).toHaveBeenCalledWith(jasmine.any(String),null);
          expect(cb).not.toHaveBeenCalledWith(jasmine.anything(),jasmine.anything());
        });

        it('Should callback idNEO if correct signup',function(){
          deps.$httpBackend.expectPOST('/signup').respond({ idNEO: 13 });
          deps.users.signup({},cb);

          deps.http.flush();

          expect(cb).toHaveBeenCalledWith(null,13);
          expect(cb).not.toHaveBeenCalledWith(jasmine.anything(),jasmine.anything());
        });
      });

      describe('Friendships',function(){

        var cb;

				beforeEach(function(){
					deps.$httpBackend.whenGET(/.*/).respond(500, 'Error');
					deps.$httpBackend.whenPOST(/.*/).respond(500, 'Error');

					deps.http.flush();

          cb = jasmine.createSpy('cb');
        });

        it('Should callback correctrly on success/error making friend',function(){
          deps.$httpBackend.expectPOST('/friend').respond(200);
          deps.users.makeFriend(13,cb);

          deps.http.flush();

          expect(cb).toHaveBeenCalledWith(null,null);
          expect(cb).not.toHaveBeenCalledWith(jasmine.anything(),jasmine.anything());
          cb.calls.reset();

          deps.$httpBackend.expectPOST('/friend').respond(500);
          deps.users.makeFriend(13,cb);

          deps.http.flush();

          expect(cb).not.toHaveBeenCalledWith(null,null);
          expect(cb).toHaveBeenCalledWith(jasmine.anything(),null);
        });

        it('Should callback correctrly on success/error deleting friend',function(){
          deps.$httpBackend.expectPOST('/delFriend').respond(200);
          deps.users.deleteFriend(13,cb);

          deps.http.flush();

          expect(cb).toHaveBeenCalledWith(null,null);
          expect(cb).not.toHaveBeenCalledWith(jasmine.anything(),jasmine.anything());
          cb.calls.reset();

          deps.$httpBackend.expectPOST('/delFriend').respond(500);
          deps.users.deleteFriend(13,cb);

          deps.http.flush();

          expect(cb).not.toHaveBeenCalledWith(null,null);
          expect(cb).toHaveBeenCalledWith(jasmine.anything(),null);
        });

        it('Should verify correctly all isX() functions',function(){
          expect(deps.users.isFriend(3)).toBe(false);
          expect(deps.users.isFriend(2)).toBe(false);
          expect(deps.users.isRequested(1)).toBe(false);
          expect(deps.users.isRequested(23)).toBe(false);
          expect(deps.users.isDemanded(33)).toBe(false);
          expect(deps.users.isDemanded(55)).toBe(false);

          deps.$httpBackend.expectPOST('/login').respond(200, { idNEO: 13});
          deps.$httpBackend.expectGET('/contacts').respond({
            friends: [ {idNEO: 3}, {idNEO: 4}],
            requested: [ {idNEO: 1}, {idNEO: 2}],
            demanded: [ {idNEO: 33}, {idNEO: 34}]
          });
          deps.session.login({});

          deps.http.flush();

          expect(deps.users.isFriend(3)).toBe(true);
          expect(deps.users.isFriend(2)).toBe(false);
          expect(deps.users.isRequested(1)).toBe(true);
          expect(deps.users.isRequested(23)).toBe(false);
          expect(deps.users.isDemanded(33)).toBe(true);
          expect(deps.users.isDemanded(55)).toBe(false);
        });

      });

      describe('Subscriptions',function(){

        var cb;

				beforeEach(function(){
					deps.$httpBackend.whenGET(/.*/).respond(500, 'Error');
					deps.$httpBackend.whenPOST(/.*/).respond(500, 'Error');

					deps.http.flush();

          cb = jasmine.createSpy('cb');
        });

        it('Should callback correctrly on success/error subscribing',function(){
          deps.$httpBackend.expectPOST('/subscribe').respond(200);
          deps.users.subscribeTo(13,cb);

          deps.http.flush();

          expect(cb).toHaveBeenCalledWith(null,null);
          expect(cb).not.toHaveBeenCalledWith(jasmine.anything(),jasmine.anything());
          cb.calls.reset();

          deps.$httpBackend.expectPOST('/subscribe').respond(500);
          deps.users.subscribeTo(13,cb);

          deps.http.flush();

          expect(cb).not.toHaveBeenCalledWith(null,null);
          expect(cb).toHaveBeenCalledWith(jasmine.anything(),null);
        });

        it('Should callback correctrly on success/error unsubscribing',function(){
          deps.$httpBackend.expectPOST('/unsubscribe').respond(200);
          deps.users.unsubscribeFrom(13,cb);

          deps.http.flush();

          expect(cb).toHaveBeenCalledWith(null,null);
          expect(cb).not.toHaveBeenCalledWith(jasmine.anything(),jasmine.anything());
          cb.calls.reset();

          deps.$httpBackend.expectPOST('/unsubscribe').respond(500);
          deps.users.unsubscribeFrom(13,cb);

          deps.http.flush();

          expect(cb).not.toHaveBeenCalledWith(null,null);
          expect(cb).toHaveBeenCalledWith(jasmine.anything(),null);
        });

      });

      describe('They',function(){

        var cb;

				beforeEach(function(){
					deps.$httpBackend.whenGET(/.*/).respond(500, 'Error');
					deps.$httpBackend.whenPOST(/.*/).respond(500, 'Error');

					deps.http.flush();

          cb = jasmine.createSpy('cb');
        });

        it('Should callback correctrly on success/error getting them',function(){
          deps.$httpBackend.expectGET('/they').respond(200,{they: [
            {idNEO: 13},
            {idNEO: 14},
            {idNEO: 15}
          ]});
          deps.users.they(cb);

          deps.http.flush();

          expect(cb).toHaveBeenCalledWith(null,[
            {idNEO: 13},
            {idNEO: 14},
            {idNEO: 15}
          ]);
          expect(cb).not.toHaveBeenCalledWith(jasmine.anything(),jasmine.anything());
          cb.calls.reset();

          deps.$httpBackend.expectGET('/they').respond(500,'Error getting them');
          deps.users.they(cb);

          deps.http.flush();

          expect(cb).not.toHaveBeenCalledWith(null,jasmine.anything());
          expect(cb).toHaveBeenCalledWith(jasmine.anything(),null);
        });
      });
    }
  });
})();
