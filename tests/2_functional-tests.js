const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
chai.use(chaiHttp);

let testId;

suite('Functional Tests', function () {
  const project = 'test-project';

  test('POST with every field', function (done) {
    chai.request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: 'Title',
        issue_text: 'Text',
        created_by: 'Tester',
        assigned_to: 'Dev',
        status_text: 'In progress'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Title');
        testId = res.body._id;
        done();
      });
  });

  test('POST with required fields only', function (done) {
    chai.request(server)
      .post(`/api/issues/${project}`)
      .send({
        issue_title: 'Req Title',
        issue_text: 'Req Text',
        created_by: 'Req Creator'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.assigned_to, '');
        done();
      });
  });

  test('POST missing required fields', function (done) {
    chai.request(server)
      .post(`/api/issues/${project}`)
      .send({ issue_title: 'Missing fields' })
      .end((err, res) => {
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test('GET all issues', function (done) {
    chai.request(server)
      .get(`/api/issues/${project}`)
      .end((err, res) => {
        assert.isArray(res.body);
        done();
      });
  });

  test('GET with one filter', function (done) {
    chai.request(server)
      .get(`/api/issues/${project}?created_by=Tester`)
      .end((err, res) => {
        assert.isArray(res.body);
        done();
      });
  });

  test('GET with multiple filters', function (done) {
    chai.request(server)
      .get(`/api/issues/${project}?created_by=Tester&open=true`)
      .end((err, res) => {
        assert.isArray(res.body);
        done();
      });
  });

  test('PUT one field', function (done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({ _id: testId, issue_text: 'Updated text' })
      .end((err, res) => {
        assert.equal(res.body.result, 'successfully updated');
        done();
      });
  });

  test('PUT multiple fields', function (done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({ _id: testId, issue_text: 'Multi', status_text: 'Fixed' })
      .end((err, res) => {
        assert.equal(res.body.result, 'successfully updated');
        done();
      });
  });

  test('PUT missing _id', function (done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({ issue_text: 'No ID' })
      .end((err, res) => {
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('PUT no update fields', function (done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({ _id: testId })
      .end((err, res) => {
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  test('PUT invalid _id', function (done) {
    chai.request(server)
      .put(`/api/issues/${project}`)
      .send({ _id: 'invalidid1234567890', issue_text: 'x' })
      .end((err, res) => {
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('DELETE valid _id', function (done) {
    chai.request(server)
      .delete(`/api/issues/${project}`)
      .send({ _id: testId })
      .end((err, res) => {
        assert.equal(res.body.result, 'successfully deleted');
        done();
      });
  });

  test('DELETE invalid _id', function (done) {
    chai.request(server)
      .delete(`/api/issues/${project}`)
      .send({ _id: 'invalidid1234567890' })
      .end((err, res) => {
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  test('DELETE missing _id', function (done) {
    chai.request(server)
      .delete(`/api/issues/${project}`)
      .send({})
      .end((err, res) => {
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});
