import { Component, OnDestroy, OnInit } from "@angular/core";
import { PostModel } from "../post.model";
import { PostsService } from "../posts.service";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material";

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html",
  styleUrls: ["./post-list.component.css"]
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: PostModel[] = [];
  isLoading = false;
  private postsSub: Subscription;
  totalPosts = 0;
  postsPerPage = 5;
  pageSizeOptions = [1, 2, 5, 10];
  currentPage = 1;
  currentCategory = "all";

  constructor(public postsService: PostsService) {}

  ngOnInit() {
    this.isLoading = true;
    this.postsService.getPosts(
      this.currentCategory,
      this.postsPerPage,
      this.currentPage
    );
    this.postsSub = this.postsService
      .getPostsUpdateListener()
      .subscribe((postData: { posts: PostModel[]; postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(
      this.currentCategory,
      this.postsPerPage,
      this.currentPage
    );
  }

  onDelete(id: string) {
    this.postsService.deletePost(id).subscribe(() => {
      this.postsService.getPosts(
        this.currentCategory,
        this.postsPerPage,
        this.currentPage
      );
    });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }
}
