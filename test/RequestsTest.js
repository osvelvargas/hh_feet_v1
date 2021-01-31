let chai = require('chai');
let chaiHttp = require('chai-http');
const expect = require('chai').expect;

chai.use(chaiHttp);
const url= 'http://localhost:8081';

describe('get getNews requests: ',()=>{
    it('should get all news', (done) => {
        chai.request(url)
            .get('/getNews')
            .end( function(err,res){
                console.log(res.body.length);
                expect(res.body).to.be.an('array')
                expect(res).to.have.status(200);
                done();
            });
    });
});

