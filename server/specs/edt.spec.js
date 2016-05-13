(function(){

    "use strict";

    var http = require('http');
    var request = require('supertest');
    var mockery = require('mockery');

    mockery.registerSubstitute('./_edt.js','../specs/mocks/_edt.mock.js');

    describe("Edt functionalities", function(){
        var server;

        beforeEach(function(){
            delete require.cache[require.resolve('../server.js')];
            mockery.enable({
                warnOnUnregistered: false
            });
            var app = require('../server.js');
            server = http.createServer(app).listen(3000);
        });

        afterEach(function(done){
            mockery.disable();
            server.close(function(err){
                if(err){
                    done.fail(err);
                }else{
                    done();
                }
            });
        });

        describe("New Activity", function(){

            it('should return 400 if no activity', function(done){
                request(server)
                  .post('/edtnewact')
                  .set('Cookie', ['RedSocialAsociacionID=3'])
                  .expect(400, 'Missing Activities')
                  .end(function(err,res){
                      if(err) {
                          return done.fail(err);
                      }
                      done();
                });
                request(server)
                  .post('/edtnewact',[])
                  .set('Cookie', ['RedSocialAsociacionID=3'])
                  .expect(400, 'Missing Activities')
                  .end(function(err,res){
                      if(err) {
                          return done.fail(err);
                      }
                      done();
                });
            });

            it('should return 401 if no user id', function(done){
                var acts = [{from: '08h00', to: '09h00'}];

                request(server)
                  .post('/edtnewact',{ activities: acts })
                  .expect(401, 'Unauthorized')
                  .end(function(err,res){
                      if(err) {
                          return done.fail(err);
                      }
                      done();
                  });
            });

            it('should return 400 if activity off limits', function(done){
                var acts = [{from: '08h00', to: '09h00'}, {from: '08h00', to: '23h00'}];

                request(server)
                  .post('/edtnewact')
                  .send({ activities: acts})
                  .set('Cookie', ['RedSocialAsociacionID=3'])
                  .expect(400, 'Activity Off Limits')
                  .end(function(err, res){
                      if(err){
                          return done.fail(err);
                      }
                      done();
                  });
            });

            it('should return 400 if activity off limits - 2', function(done){
                var acts = [{from: '08h00', to: '09h00'}, {from: '07h00', to: '22h00'}];

                request(server)
                  .post('/edtnewact')
                  .send({ activities: acts })
                  .set('Cookie', ['RedSocialAsociacionID=3'])
                  .expect(400, 'Activity Off Limits')
                  .end(function(err, res){
                      if(err){
                          return done.fail(err);
                      }
                      done();
                  });
            });

            it('should return 200 if activity is correct' , function(done){
                var acts = [{from: '08h00', to: '09h00'}, {from: '08h00', to: '22h00'}];

                request(server)
                  .post('/edtnewact')
                  .send({ activities: acts })
                  .set('Cookie', ['RedSocialAsociacionID=3'])
                  .expect(200, 'Activity Created Successfully')
                  .end(function(err, res){
                      if(err){
                          return done.fail(err);
                      }
                      done();
                  });
            });
        });

        describe('Merge Calendars', function(){

            it('should return 401 if not logged in', function(done){

                request(server)
                  .post('/edtmergecal')
                  .expect(401, 'Unauthorized')
                  .end(function(err, res){
                      if(err){
                          return done.fail(err);
                      }
                      done();
                  });
            });

            it('should return 400 if some data is missing', function(done){
                var dataWrong1 = {idNEO: 58};

                request(server)
                  .post('/edtmergecal')
                  .send(dataWrong1)
                  .set('Cookie', ['LinkedEnibId=3'])
                  .expect(400, 'Missing Parameters')
                  .end(function(err, res){
                      if(err){
                          return done.fail(err);
                      }
                      done();
                  });
            });

            it('should return 400 if some data is missing - 2', function(done){
                var dataWrong2 = {mergeCal: true};

                request(server)
                  .post('/edtmergecal')
                  .send(dataWrong2)
                  .set('Cookie', ['LinkedEnibId=3'])
                  .expect(400, 'Missing Parameters')
                  .end(function(err, res){
                      if(err){
                          return done.fail(err);
                      }
                      done();
                  });
            });

            it('should return 200 if data is ok', function(done){
                var dataCorrect = {idNEO: 58, mergeCal: true};

                request(server)
                  .post('/edtmergecal')
                  .send(dataCorrect)
                  .set('Cookie', ['LinkedEnibId=3'])
                  .expect(200, 'Ok')
                  .end(function(err, res){
                      if(err){
                          return done.fail(err);
                      }
                      done();
                  });
            });

            it('should return 400 if type of data is incorrect', function(done){
                var dataWrong1 = {idNEO: "58", mergeCal: true};

                request(server)
                  .post('/edtmergecal')
                  .send(dataWrong1)
                  .set('Cookie', ['LinkedEnibId=3'])
                  .expect(400, 'Incorrect Data Type')
                  .end(function(err, res){
                      if(err){
                          done.fail(err);
                      }
                      done();
                  });
            });

            it('should return 400 if type of data is incorrect', function(done){
                var dataWrong2 = {idNEO: 58, mergeCal: "asd"};

                request(server)
                  .post('/edtmergecal')
                  .send(dataWrong2)
                  .set('Cookie', ['LinkedEnibId=3'])
                  .expect(400, 'Incorrect Data Type')
                  .end(function(err, res){
                      if(err){
                          done.fail(err);
                      }
                      done();
                  });
            });
        });
    });
})();
