# 참고 URL
# https://help.github.com/en/packages/using-github-packages-with-your-projects-ecosystem/configuring-docker-for-use-with-github-packages
echo "docker.pkg.github.com/hansanghyeon/meta-crawler/meta-crawler:VERSION"
read -p "도커이미지 빌드할 버전: " val
docker build -t docker.pkg.github.com/hansanghyeon/meta-crawler/meta-crawler:$val ./
# read -p "도커이미지 github push? (yes or no): " val
# docker push docker.pkg.github.com/hansanghyeon/meta-crawler/meta-crawler:$val
