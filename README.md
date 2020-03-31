# allusion

ALLUsion location intelligence platform (BETA) for querying and visualizing geospatial linked data.

ALLUsion is licensed under the GNU General Public License v3.0.

## Development environment

* Run `npm install` to install dependencies
* Run `npm run dev-server` to run the development server (frontend)

## Build

* Run `npm run build` to build the production version

## Deployment

More detailed instructions in Spatineo plan.io

### Test environment

Test environment is running at http://allusion.spatineo-devops.com/test/

* Make sure you have your AWS credentials configured (use `--profile <profile name> --region <region>` in the next command if needed)
* Test command with `--dryrun`
* Run `aws s3 sync dist/ s3://<bucket name> --delete`
* Invalidate the CloudFront cache `aws cloudfront create-invalidation --distribution-id <distribution id> --paths "/test/*"`
* Check progress `aws cloudfront list-invalidations --distribution-id <distribution id>`

### Production environment

Test environment is running at http://allusion.spatineo-devops.com/

* Make sure you have your AWS credentials configured (use `--profile <profile name> --region <region>` in the next command if needed)
* Test command with `--dryrun`
* Run `aws s3 sync dist/ s3://<bucket name>`
* --delete removed so that the /test/ -folder would not be deleted
* Invalidate the CloudFront cache `aws cloudfront create-invalidation --distribution-id <distribution id> --paths "/test/*"`
* Check progress `aws cloudfront list-invalidations --distribution-id <distribution id>`
