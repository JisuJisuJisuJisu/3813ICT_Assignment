import request from 'supertest';
import { expect } from 'chai';
import { app, startServer } from '../server/server.js'; // 서버 파일 경로 조정

describe('API Tests', function () {
    let server;

    before(async function () {
        process.env.NODE_ENV = 'test';
        server = app.listen(3001); // 테스트용 포트
    });

    after(async function () {
        server.close(); // 테스트가 끝난 후 서버를 종료
    });

    afterEach(async function () {
      if (server) {
          await server.close();
      }
  });

    describe('GET /', function () {
        it('should return Server is running', function (done) {
            request(app)
                .get('/')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.text).to.equal('Server is running');
                    done();
                });
        });
    });

    describe('POST /signup', function () {
        it('should register a new user', function (done) {
            const newUser = {
                email: 'testuser@example.com',
                password: 'testpassword',
                username: 'testuser'
            };

            request(app)
                .post('/signup')
                .send(newUser)
                .expect(201)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('email', newUser.email);
                    done();
                });
        });

        it('should return 409 if the user already exists', function (done) {
            const existingUser = {
                email: 'testuser@example.com',
                password: 'testpassword',
                username: 'testuser'
            };

            request(app)
                .post('/signup')
                .send(existingUser)
                .expect(409)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('message', 'User already exists');
                    done();
                });
        });
    });

    describe('POST /login', function () {
        it('should log in an existing user', function (done) {
            const loginCredentials = {
                email: 'testuser@example.com',
                password: 'testpassword'
            };

            request(app)
                .post('/login')
                .send(loginCredentials)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('message', 'Login successful');
                    done();
                });
        });

        it('should return 401 for invalid credentials', function (done) {
            const invalidCredentials = {
                email: 'wronguser@example.com',
                password: 'wrongpassword'
            };

            request(app)
                .post('/login')
                .send(invalidCredentials)
                .expect(401)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('message', 'Invalid email or password');
                    done();
                });
        });
    });

    describe('GET /users', function () {
        it('should return all users', function (done) {
            request(app)
                .get('/users')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('array');
                    done();
                });
        });
    });

    describe('POST /groups', function () {
        it('should create a new group', function (done) {
            const newGroup = {
                id: 'group123',
                name: 'Test Group',
                description: 'A group for testing',
                createdBy: 'testuser@example.com'
            };

            request(app)
                .post('/groups')
                .send(newGroup)
                .expect(201)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('name', newGroup.name);
                    done();
                });
        });
    });

    // PUT /groups/approve/:groupId
    describe('PUT /groups/approve/:groupId', function () {
      it('should approve a user to a group', function (done) {
          const groupId = 'group123';
          const approvalData = {
              userId: 'user123'
          };

          request(app)
              .put(`/groups/approve/${groupId}`)
              .send(approvalData)
              .expect(200)
              .end((err, res) => {
                  if (err) return done(err);
                  expect(res.body).to.have.property('message', 'User approved successfully');
                  done();
              });
      });

      it('should return 404 if the group does not exist', function (done) {
          const groupId = 'nonExistentGroupId';
          const approvalData = {
              userId: 'user123'
          };

          request(app)
              .put(`/groups/approve/${groupId}`)
              .send(approvalData)
              .expect(404)
              .end((err, res) => {
                  if (err) return done(err);
                  expect(res.body).to.have.property('message', 'Group not found');
                  done();
              });
      });
  });

  // PUT /groups/reject/:groupId
  describe('PUT /groups/reject/:groupId', function () {
      it('should reject a user from joining a group', function (done) {
          const groupId = 'group123';
          const rejectionData = {
              userId: 'user123'
          };

          request(app)
              .put(`/groups/reject/${groupId}`)
              .send(rejectionData)
              .expect(200)
              .end((err, res) => {
                  if (err) return done(err);
                  expect(res.body).to.have.property('message', 'Join request rejected successfully');
                  done();
              });
      });

      it('should return 404 if the group does not exist', function (done) {
          const groupId = 'nonExistentGroupId';
          const rejectionData = {
              userId: 'user123'
          };

          request(app)
              .put(`/groups/reject/${groupId}`)
              .send(rejectionData)
              .expect(404)
              .end((err, res) => {
                  if (err) return done(err);
                  expect(res.body).to.have.property('message', 'Group not found');
                  done();
              });
      });
  });

  // POST /group/:groupId/invite
  describe('POST /group/:groupId/invite', function () {
      it('should invite a user to a group', function (done) {
          const groupId = 'group123';
          const inviteData = {
              userId: 'user123'
          };

          request(app)
              .post(`/group/${groupId}/invite`)
              .send(inviteData)
              .expect(200)
              .end((err, res) => {
                  if (err) return done(err);
                  expect(res.body).to.have.property('message', 'User invited successfully');
                  done();
              });
      });

      it('should return 404 if the group does not exist', function (done) {
          const groupId = 'nonExistentGroupId';
          const inviteData = {
              userId: 'user123'
          };

          request(app)
              .post(`/group/${groupId}/invite`)
              .send(inviteData)
              .expect(404)
              .end((err, res) => {
                  if (err) return done(err);
                  expect(res.body).to.have.property('message', 'Group not found');
                  done();
              });
      });
  });

  describe('DELETE /groups/:groupId/members/:memberId', function () {
    it('should delete a member from the group', function (done) {
        const groupId = 'group123';
        const memberId = 'member123';
        const loggedInUser = {
            roles: ['Super Admin'] // 사용자 권한 설정
        };

        request(app)
            .delete(`/groups/${groupId}/members/${memberId}`)
            .send({ loggedInUser })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('message', 'Member deleted successfully');
                done();
            });
    });

    it('should return 403 if the user does not have permission', function (done) {
        const groupId = 'group123';
        const memberId = 'member123';
        const loggedInUser = {
            roles: ['Chat User'] // 권한 부족
        };

        request(app)
            .delete(`/groups/${groupId}/members/${memberId}`)
            .send({ loggedInUser })
            .expect(403)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('message', 'You do not have permission to delete members.');
                done();
            });
    });
});
describe('POST /upload-chat-image', function () {
  it('should upload a chat image successfully', function (done) {
      request(app)
          .post('/upload-chat-image')
          .attach('image', 'path/to/test/chatimage.jpg')  // 가짜 이미지 경로
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('imageUrl');
              done();
          });
  });

  it('should return 400 if no image is uploaded', function (done) {
      request(app)
          .post('/upload-chat-image')
          .expect(400)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'No file uploaded');
              done();
          });
  });
});

describe('PUT /groups/:groupId/channels/:channelId', function () {
  it('should update a specific channel', function (done) {
      const updatedChannel = {
          name: 'Updated Channel',
          description: 'Updated Description'
      };

      request(app)
          .put('/groups/group123/channels/channel123')
          .send(updatedChannel)
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'Channel updated successfully');
              done();
          });
  });

  it('should return 404 if the channel is not found', function (done) {
      request(app)
          .put('/groups/group123/channels/nonexistentChannel')
          .send({ name: 'New Channel' })
          .expect(404)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'Channel not found');
              done();
          });
  });
});

describe('DELETE /channels/:channelId', function () {
  it('should delete a specific channel', function (done) {
      request(app)
          .delete('/channels/channel123')
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'Channel deleted successfully');
              done();
          });
  });

  it('should return 404 if the channel is not found', function (done) {
      request(app)
          .delete('/channels/nonexistentChannel')
          .expect(404)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'Channel not found');
              done();
          });
  });
});

describe('GET /groups/:groupId/channels', function () {
  it('should return all channels in a specific group', function (done) {
      request(app)
          .get('/groups/group123/channels')
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.be.an('array');
              done();
          });
  });

  it('should return 404 if the group is not found', function (done) {
      request(app)
          .get('/groups/nonexistentGroup/channels')
          .expect(404)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'Group not found');
              done();
          });
  });
});

describe('PUT /users/:userId', function () {
  it('should update user information', function (done) {
      const updatedUser = {
          username: 'newUsername',
          email: 'newEmail@example.com'
      };

      request(app)
          .put('/users/user123')
          .send(updatedUser)
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'User updated successfully');
              done();
          });
  });

  it('should return 404 if the user is not found', function (done) {
      request(app)
          .put('/users/nonexistentUser')
          .send({ username: 'newUsername' })
          .expect(404)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'User not found');
              done();
          });
  });
});

describe('DELETE /users/:userId', function () {
  it('should delete a user by userId', function (done) {
      request(app)
          .delete('/users/user123')
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'User with ID user123 deleted successfully');
              done();
          });
  });

  it('should return 404 if the user is not found', function (done) {
      request(app)
          .delete('/users/nonexistentUser')
          .expect(404)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'User not found');
              done();
          });
  });
});





  // POST /groups/:groupId/join
  describe('POST /groups/:groupId/join', function () {
      it('should submit a join request for a user', function (done) {
          const groupId = 'group123';
          const joinData = {
              email: 'testuser@example.com'
          };

          request(app)
              .post(`/groups/${groupId}/join`)
              .send(joinData)
              .expect(200)
              .end((err, res) => {
                  if (err) return done(err);
                  expect(res.body).to.have.property('message', 'Join request submitted successfully');
                  done();
              });
      });

      it('should return 404 if the group does not exist', function (done) {
          const groupId = 'nonExistentGroupId';
          const joinData = {
              email: 'testuser@example.com'
          };

          request(app)
              .post(`/groups/${groupId}/join`)
              .send(joinData)
              .expect(404)
              .end((err, res) => {
                  if (err) return done(err);
                  expect(res.body).to.have.property('message', 'Group not found');
                  done();
              });
      });
  });

  // GET /users/:email/interest-groups
  describe('GET /users/:email/interest-groups', function () {
      it('should return the interest groups of the user', function (done) {
          const email = 'testuser@example.com';

          request(app)
              .get(`/users/${email}/interest-groups`)
              .expect(200)
              .end((err, res) => {
                  if (err) return done(err);
                  expect(res.body).to.be.an('array');
                  done();
              });
      });

      it('should return 404 if the user does not exist', function (done) {
          const email = 'nonExistentUser@example.com';

          request(app)
              .get(`/users/${email}/interest-groups`)
              .expect(404)
              .end((err, res) => {
                  if (err) return done(err);
                  expect(res.body).to.have.property('message', 'User not found');
                  done();
              });
      });
  });

  describe('POST /upload-profile-image', function () {
    it('should upload a profile image and update the user record', function (done) {
        request(app)
            .post('/upload-profile-image')
            .field('userId', 'testuser123') // replace with a real userId
            .attach('profileImage', 'path/to/testimage.jpg')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('message', 'Image uploaded successfully');
                expect(res.body).to.have.property('imageUrl');
                done();
            });
    });

    it('should return 400 if no file is uploaded', function (done) {
        request(app)
            .post('/upload-profile-image')
            .field('userId', 'testuser123')
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.have.property('message', 'No file uploaded');
                done();
            });
    });
});
describe('POST /upload-group-image', function () {
  it('should upload a group image', function (done) {
      request(app)
          .post('/upload-group-image')
          .attach('image', 'path/to/testimage.jpg')
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('imageUrl');
              done();
          });
  });

  it('should return 400 if no image is uploaded', function (done) {
      request(app)
          .post('/upload-group-image')
          .expect(400)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'No file uploaded');
              done();
          });
  });
});

describe('GET /users/:email/interest-groups', function () {
  it('should return a list of interest groups for the user', function (done) {
      request(app)
          .get('/users/testuser@example.com/interest-groups')
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.be.an('array');
              done();
          });
  });

  it('should return 404 if the user is not found', function (done) {
      request(app)
          .get('/users/nonexistent@example.com/interest-groups')
          .expect(404)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'User not found');
              done();
          });
  });
});
describe('PUT /groups/approve/:groupId', function () {
  it('should approve a user to a group', function (done) {
      const userData = { userId: 'testuser123' };
      request(app)
          .put('/groups/approve/group123')
          .send(userData)
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'User approved successfully');
              done();
          });
  });

  it('should return 404 if the group does not exist', function (done) {
      request(app)
          .put('/groups/approve/nonexistentgroup')
          .send({ userId: 'testuser123' })
          .expect(404)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'Group not found');
              done();
          });
  });
});

describe('PUT /groups/reject/:groupId', function () {
  it('should reject a user from joining a group', function (done) {
      const userData = { userId: 'testuser123' };
      request(app)
          .put('/groups/reject/group123')
          .send(userData)
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'Join request rejected successfully');
              done();
          });
  });

  it('should return 404 if the group does not exist', function (done) {
      request(app)
          .put('/groups/reject/nonexistentgroup')
          .send({ userId: 'testuser123' })
          .expect(404)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'Group not found');
              done();
          });
  });
});
describe('POST /groups/:groupId/join', function () {
  it('should submit a join request for a group', function (done) {
      const requestBody = { email: 'testuser@example.com' };
      request(app)
          .post('/groups/group123/join')
          .send(requestBody)
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'Join request submitted successfully');
              done();
          });
  });

  it('should return 404 if the group does not exist', function (done) {
      request(app)
          .post('/groups/nonexistentgroup/join')
          .send({ email: 'testuser@example.com' })
          .expect(404)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'Group not found');
              done();
          });
  });
});

describe('POST /group/:groupId/invite', function () {
  it('should invite a user to a group', function (done) {
      const requestBody = { userId: 'testuser123' };
      request(app)
          .post('/group/group123/invite')
          .send(requestBody)
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'User invited successfully');
              done();
          });
  });

  it('should return 404 if the group is not found', function (done) {
      const requestBody = { userId: 'testuser123' };
      request(app)
          .post('/group/nonexistentgroup/invite')
          .send(requestBody)
          .expect(404)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'Group not found');
              done();
          });
  });
});

describe('GET /messages', function () {
  it('should return all messages for a specific channel', function (done) {
      request(app)
          .get('/messages?channelId=channel123')
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.be.an('array');
              done();
          });
  });

  it('should return 400 if channelId is missing', function (done) {
      request(app)
          .get('/messages')
          .expect(400)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'channelId query parameter is missing');
              done();
          });
  });
});

describe('POST /messages', function () {
  it('should add a new message to a channel', function (done) {
      const newMessage = {
          channelId: 'channel123',
          userId: 'testuser123',
          message: 'Hello, this is a test message!'
      };
      request(app)
          .post('/messages')
          .send(newMessage)
          .expect(201)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'Message saved successfully');
              expect(res.body).to.have.property('savedMessage');
              done();
          });
  });

  it('should return 400 if required fields are missing', function (done) {
      request(app)
          .post('/messages')
          .send({ channelId: 'channel123', message: 'Test message without userId' })
          .expect(400)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'Missing required fields: channelId, userId, message');
              done();
          });
  });
});

describe('DELETE /channels/:channelId', function () {
  it('should delete a specific channel by channelId', function (done) {
      request(app)
          .delete('/channels/channel123')
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'Channel deleted successfully');
              done();
          });
  });

  it('should return 404 if the channel is not found', function (done) {
      request(app)
          .delete('/channels/nonexistentchannel')
          .expect(404)
          .end((err, res) => {
              if (err) return done(err);
              expect(res.body).to.have.property('message', 'Channel not found');
              done();
          });
  });
});




  // POST /upload-group-image
  describe('POST /upload-group-image', function () {
      it('should upload a group image and return the image URL', function (done) {
          request(app)
              .post('/upload-group-image')
              .attach('image', 'path/to/test/image.jpg')  // 가짜 이미지 경로
              .expect(200)
              .end((err, res) => {
                  if (err) return done(err);
                  expect(res.body).to.have.property('imageUrl');
                  done();
              });
      });

      it('should return 400 if no image is uploaded', function (done) {
          request(app)
              .post('/upload-group-image')
              .expect(400)
              .end((err, res) => {
                  if (err) return done(err);
                  expect(res.body).to.have.property('message', 'No file uploaded');
                  done();
              });
      });
  });
});
    

