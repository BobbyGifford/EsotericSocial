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
  totalPosts = 10;
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
      .subscribe((posts: PostModel[]) => {
        this.isLoading = false;
        this.posts = posts;
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(
      this.currentCategory,
      this.postsPerPage,
      this.currentPage
    );
  }

  onDelete(id: string) {
    this.postsService.deletePost(id);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }
}
